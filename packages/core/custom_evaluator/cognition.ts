import {
    composeContext,
    generateText,
    parseJsonArrayFromText as parseJsonFromText,
} from "../src";
import {
    IAgentRuntime,
    Memory,
    ModelClass,
    type State,
    Evaluator,
} from "../src";

const cognitionTemplate = `TASK: 评估用户的Web3知识水平
分析对话内容并评估用户在各个Web3领域的认知水平。

# 评估说明
- 审查对话内容,识别用户展现出的Web3相关知识
- 根据用户的表述评估其在各个领域的认知水平
- 仅更新有新信息支撑的领域评分
- 记录用户表现出的具体知识点

# 开始评估

{{recentMessages}}

任务: 分析对话并评估用户的Web3认知水平。请以JSON格式返回评估结果。

评分格式:
\`\`\`json
{
  "basic_knowledge": {
    "blockchain": number,      // 0-1, 区块链基础知识
    "consensus": number,       // 0-1, 共识机制理解
    "cryptography": number,    // 0-1, 密码学知识
    "tokenomics": number,      // 0-1, 代币经济学理解
    "network_types": number    // 0-1, 公链/联盟链/私链特点
  },
  "technical_knowledge": {
    "smart_contracts": number, // 0-1, 智能合约开发
    "web3_stack": number,      // 0-1, Web3技术栈
    "security": number,        // 0-1, 安全知识
    "scaling": number,         // 0-1, 扩容解决方案
    "cross_chain": number,     // 0-1, 跨链技术
    "storage": number         // 0-1, 去中心化存储
  },
  "defi_knowledge": {
    "protocols": number,      // 0-1, DeFi协议理解
    "trading": number,        // 0-1, 交易知识
    "yield": number,          // 0-1, 收益耕作
    "risks": number,          // 0-1, 风险认知
    "stablecoins": number,    // 0-1, 稳定币机制
    "derivatives": number     // 0-1, 衍生品
  },
  "ecosystem_knowledge": {
    "governance": number,     // 0-1, DAO治理
    "nft": number,           // 0-1, NFT生态
    "gaming": number,        // 0-1, GameFi
    "social": number,        // 0-1, SocialFi
    "metaverse": number,     // 0-1, 元宇宙
    "identity": number       // 0-1, 去中心化身份
  },
  "regulatory_knowledge": {
    "compliance": number,     // 0-1, 合规认知
    "taxation": number,       // 0-1, 税收政策
    "licensing": number,      // 0-1, 牌照要求
    "privacy": number        // 0-1, 隐私保护
  },
  "demonstrated_knowledge": string[], // 用户展现出的具体知识点
  "knowledge_gaps": string[],        // 识别出的知识盲点
  "learning_suggestions": string[]   // 学习建议
}
\`\`\``;

async function handler(
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined
): Promise<void> {
    state = (await runtime.composeState(message)) as State;
    const context = composeContext({
        state,
        template: cognitionTemplate,
    });

    const response = await generateText({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });

    const updates = parseJsonFromText(response);
    if (!updates) return;

    // 存储评估结果到内存系统
    await runtime.messageManager.createMemory({
        type: "cognition_assessment",
        roomId: message.roomId,
        userId: message.userId,
        agentId: runtime.agentId,
        content: updates,
        unique: false,
    });
}

export const cognitionEvaluator: Evaluator = {
    name: "UPDATE_COGNITION",
    similes: [
        "ANALYZE_KNOWLEDGE",
        "UPDATE_WEB3_LEVEL",
        "EVALUATE_UNDERSTANDING",
    ],
    description: "分析对话内容并评估用户在Web3各个领域的认知水平。",
    validate: async (
        runtime: IAgentRuntime,
        message: Memory
    ): Promise<boolean> => {
        // 每20条消息触发一次评估
        const messageCount = await runtime.messageManager.countMemories(
            message.roomId
        );
        return messageCount % 20 === 0;
    },
    handler,
    examples: [
        {
            context: "对话中展现了用户的Web3知识水平",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "我觉得Layer2的ZK rollup比Optimistic rollup在安全性和性能上都更有优势,但实现难度更大。",
                    },
                },
                {
                    user: "{{user2}}",
                    content: {
                        text: "是的,ZK rollup的零知识证明可以即时确认交易,但电路设计和证明生成都很复杂。",
                    },
                },
            ],
            outcome: `{
                "technical_knowledge": {
                    "scaling": 0.8,
                    "security": 0.7
                },
                "basic_knowledge": {
                    "blockchain": 0.7
                },
                "demonstrated_knowledge": [
                    "理解Layer2扩容方案的区别",
                    "了解零知识证明技术"
                ],
                "learning_suggestions": [
                    "深入学习ZK rollup的技术实现",
                    "了解更多Layer2解决方案的应用场景"
                ]
            }`,
        },
    ],
};
