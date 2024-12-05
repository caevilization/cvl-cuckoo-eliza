import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    UUID,
} from "@ai16z/eliza";
import { v4 } from "uuid";

export const lectureAction: Action = {
    name: "LECTURE",
    similes: ["TEACH", "INSTRUCT", "EXPLAIN"],
    description:
        "用于进行课程讲解的动作。会根据课程内容和对话上下文,判断是继续讲解、等待反馈、解答疑问还是结束课程。",

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "我想学习区块链的基础知识" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "好的,让我们从区块链的定义开始。区块链是一个分布式账本技术,它通过密码学原理保证数据不可篡改。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "明白了,那么区块链和比特币有什么关系?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "比特币是第一个也是最著名的区块链应用。它使用区块链技术来记录所有交易,确保交易的安全性和不可篡改性。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "让我们来做个小测验:区块链的主要特点是什么?",
                    action: "QUIZ",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "是分布式和不可篡改性" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "回答正确!现在让我们继续学习共识机制的概念。",
                    action: "LECTURE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "想了解智能合约是什么" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "智能合约是运行在区块链上的程序代码,可以自动执行预设的条件和规则。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "最流行的智能合约平台是以太坊,它使用Solidity语言编写智能合约。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "那智能合约可以用来做什么?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "智能合约可以用于DeFi、NFT交易、去中心化应用等多个领域。让我举个例子...",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "小测验:智能合约的主要优势是什么?",
                    action: "QUIZ",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "请讲解DeFi的概念" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "DeFi(去中心化金融)是建立在区块链上的金融服务系统,无需传统金融机构参与。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "具体有哪些DeFi应用?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "主要包括去中心化交易所(DEX)、借贷平台、流动性挖矿等。比如Uniswap就是...",
                    action: "LECTURE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "想学习NFT相关知识" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "NFT(非同质化代币)是区块链上独一无二的数字资产证明。每个NFT都有唯一的标识符。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "NFT可以用来做什么?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "NFT广泛应用于数字艺术品、游戏道具、虚拟房地产等领域...",
                    action: "LECTURE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "请介绍Web3的概念" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Web3是互联网的下一代形态,它基于区块链技术,实现去中心化和用户数据主权。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "与Web2相比,Web3的主要特点是...",
                    action: "LECTURE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "想了解加密货币钱包" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "加密货币钱包是用于存储和管理加密资产的工具,分为热钱包和冷钱包两种。",
                    action: "LECTURE",
                },
            },
            {
                user: "{{user1}}",
                content: { text: "什么是私钥?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "私钥是证明资产所有权的密钥,必须安全保管。现在我来测试一下...",
                    action: "LECTURE",
                },
            },
        ],
    ],

    validate: async (
        runtime: IAgentRuntime,
        message: Memory
    ): Promise<boolean> => {
        // 获取用户的学习记录
        const learningRecords =
            await runtime.databaseAdapter.getLearningRecordsByUser(
                message.userId
            );

        // 从消息内容中获取课程ID
        const courseId = message.content.courseId;
        if (!courseId) {
            return false;
        }

        // 检查该课程的学习记录
        const courseRecord = learningRecords.find(
            (record) => record.courseId === courseId
        );

        // 如果已完成该课程,则不再进行讲解
        if (courseRecord && courseRecord.status === "completed") {
            return false;
        }

        return true;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<void> => {
        if (!state || !callback) return;

        const courseId = message.content.courseId as UUID;

        // 获取课程内容
        const course = await runtime.databaseAdapter.getCourseById(courseId);
        if (!course) {
            return;
        }

        // 获取学习记录
        const learningRecord = await runtime.databaseAdapter
            .getLearningRecordsByUser(message.userId)
            .then((records) => records.find((r) => r.courseId === courseId));

        const currentProgress = learningRecord?.progress || 0;

        // 获取最近对话记录
        const recentMessages = await runtime.messageManager.getMemories({
            roomId: message.roomId,
            count: 5,
        });

        // 分析最近对话,判断下一步动作
        const lastMessage = recentMessages[0];
        const response = {
            text: "",
            action: "LECTURE",
        };

        // 检查是否在回答Quiz
        if (state && state.waitingForQuizAnswer) {
            const isCorrect = checkQuizAnswer(
                state.currentQuiz as Quiz,
                lastMessage.content.text
            );
            if (isCorrect) {
                response.text = "回答正确!让我们继续下一部分内容。\n\n";
                response.text += generateNextLectureContent(
                    course.content,
                    currentProgress
                );
                state.waitingForQuizAnswer = false;
                state.currentQuiz = null;
            } else {
                response.text =
                    "这个答案不太对哦。要不要再想想看？提示: " +
                    (state.currentQuiz as Quiz).hint;
                await callback(response);
                return;
            }
        } else if (
            lastMessage.content.text.includes("?") ||
            lastMessage.content.text.includes("问题")
        ) {
            // 解答用户疑问
            response.text = `让我来解答你的问题。关于"${lastMessage.content.text}",`;
            response.text += generateAnswerFromCourseContent(
                course.content,
                lastMessage.content.text
            );
        } else if (currentProgress >= 100) {
            // 课程完成,记录并发放奖励
            await runtime.databaseAdapter.updateLearningRecord({
                id: learningRecord?.id || (v4() as UUID),
                userId: message.userId,
                courseId,
                status: "completed",
                completedAt: new Date(),
                progress: currentProgress,
                createdAt: learningRecord?.createdAt || new Date(),
                lastAccessedAt: new Date(),
            });

            response.text = "恭喜你完成了本节课程!";
            // TODO: 发放奖励逻辑
        } else if (shouldGenerateQuiz(recentMessages, course.content)) {
            // 生成测验题
            const quiz = generateQuiz(course.content, currentProgress);
            state.waitingForQuizAnswer = true;
            state.currentQuiz = quiz;
            response.text =
                quiz.question +
                "\n\n" +
                quiz.options.map((opt, idx) => `${idx + 1}. ${opt}`).join("\n");
        } else if (shouldWaitForFeedback(recentMessages)) {
            // 等待用户反馈
            response.text = "你理解这部分内容吗?如果有任何疑问都可以随时提出。";
        } else {
            // 继续讲解课程
            response.text = generateNextLectureContent(
                course.content,
                currentProgress
            );

            // 更新学习进度
            await runtime.databaseAdapter.updateLearningRecord({
                id: learningRecord?.id || (v4() as UUID),
                userId: message.userId,
                courseId,
                progress: Math.min(currentProgress + 10, 100),
                lastAccessedAt: new Date(),
                createdAt: learningRecord?.createdAt || new Date(),
                status: learningRecord?.status || "in_progress",
            });
        }

        await callback(response);
    },
};

interface CourseContent {
    keyPoints: KeyPoint[];
}

interface KeyPoint {
    topic: string;
    statement: string;
    isTrue: boolean;
    correctStatement: string;
    wrongStatements: string[];
    hint?: string;
}

interface Quiz {
    type: "multiChoice" | "trueFalse";
    question: string;
    options: string[];
    correctAnswer: number;
    hint: string;
}

// 辅助函数:从课程内容中生成答案
function generateAnswerFromCourseContent(
    courseContent: CourseContent,
    question: string
): string {
    // 遍历课程内容中的知识点
    for (const keyPoint of courseContent.keyPoints) {
        // 检查问题是否与当前知识点相关
        if (question.includes(keyPoint.topic)) {
            // 如果问题是判断题
            if (
                question.includes("是否正确") ||
                question.includes("对还是错")
            ) {
                return keyPoint.isTrue
                    ? `正确。${keyPoint.statement}`
                    : `错误。${keyPoint.correctStatement}`;
            }

            // 如果是选择题或开放性问题
            return keyPoint.correctStatement;
        }
    }

    // 如果没有找到相关知识点,返回提示信息
    return "抱歉,我需要更多上下文来回答这个问题。你能具体说明是关于哪部分内容的问题吗?";
}

// 辅助函数:判断是否应该生成测验题
function shouldGenerateQuiz(
    messages: Memory[],
    courseContent: CourseContent
): boolean {
    // 判断课程内容是否包含重要知识点
    const hasKeyKnowledgePoints =
        courseContent.keyPoints && courseContent.keyPoints.length > 0;

    // 判断最近的对话是否已经有足够的内容讲解
    const hasEnoughContent =
        messages.filter(
            (m) =>
                m.content.action === "LECTURE" && !m.content.text.includes("?")
        ).length >= 3;

    // 判断是否最近没有进行过测验
    const noRecentQuiz = !messages
        .slice(0, 3)
        .some(
            (m) =>
                m.content.text.includes("选择题") ||
                m.content.text.includes("判断题")
        );

    return hasKeyKnowledgePoints && hasEnoughContent && noRecentQuiz;
}

// 辅助函数:生成测验题
function generateQuiz(courseContent: CourseContent, progress: number): Quiz {
    const currentSection = Math.floor(progress / 20); // 将进度分为5个区段
    const keyPoints =
        courseContent.keyPoints[currentSection] || courseContent.keyPoints[0];

    // 随机决定是生成判断题还是选择题
    const isMultiChoice = Math.random() > 0.5;

    if (isMultiChoice) {
        // 生成2-4个选项的选择题
        const optionsCount = Math.floor(Math.random() * 3) + 2;
        return {
            type: "multiChoice",
            question: `关于${keyPoints.topic}，下列哪个说法是正确的？`,
            options: generateMultiChoiceOptions(keyPoints, optionsCount),
            correctAnswer: 1, // 正确答案的索引
            hint: keyPoints.hint || "回顾一下刚才讲解的内容",
        };
    } else {
        // 生成判断题
        return {
            type: "trueFalse",
            question: `判断题：${keyPoints.statement}`,
            options: ["正确", "错误"],
            correctAnswer: keyPoints.isTrue ? 1 : 2,
            hint: keyPoints.hint || "仔细想想刚才的讲解",
        };
    }
}

// 辅助函数:生成选择题选项
function generateMultiChoiceOptions(
    keyPoint: KeyPoint,
    count: number
): string[] {
    const options = [keyPoint.correctStatement];
    while (options.length < count) {
        options.push(keyPoint.wrongStatements[options.length - 1]);
    }
    // 随机打乱选项顺序
    return options.sort(() => Math.random() - 0.5);
}

// 辅助函数:检查测验答案
function checkQuizAnswer(quiz: Quiz, answer: string): boolean {
    if (quiz.type === "trueFalse") {
        // 判断题答案检查
        if (
            answer.includes("正确") ||
            answer.includes("对") ||
            answer === "1"
        ) {
            return quiz.correctAnswer === 1;
        } else if (
            answer.includes("错误") ||
            answer.includes("错") ||
            answer === "2"
        ) {
            return quiz.correctAnswer === 2;
        }
    } else {
        // 选择题答案检查
        const numAnswer = parseInt(answer);
        if (!isNaN(numAnswer)) {
            return numAnswer === quiz.correctAnswer;
        }
        // 检查答案文本是否匹配选项内容
        const answerIndex = quiz.options.findIndex((opt) =>
            answer.toLowerCase().includes(opt.toLowerCase())
        );
        return answerIndex + 1 === quiz.correctAnswer;
    }
    return false;
}

// 辅助函数:判断是否需要等待用户反馈
function shouldWaitForFeedback(messages: Memory[]): boolean {
    // 统计连续的讲解消息数量
    let consecutiveLectureCount = 0;

    for (const message of messages) {
        if (message.content.action === "LECTURE") {
            consecutiveLectureCount++;
        } else {
            break;
        }
    }

    // 如果连续10条以上都是讲解消息,有80%概率等待反馈
    if (consecutiveLectureCount >= 10) {
        return Math.random() < 0.8;
    }

    return false;
}

// 辅助函数:生成下一段课程内容
function generateNextLectureContent(
    courseContent: CourseContent,
    progress: number
): string {
    // 根据进度计算当前要讲解的知识点索引
    const keyPointIndex = Math.floor(
        progress / (100 / courseContent.keyPoints.length)
    );
    const currentKeyPoint = courseContent.keyPoints[keyPointIndex];

    if (!currentKeyPoint) {
        return "课程内容已全部讲解完毕。";
    }

    // 生成讲解内容
    let content = `让我们来学习关于"${currentKeyPoint.topic}"的内容:\n\n`;
    content += currentKeyPoint.statement + "\n\n";

    // 添加一些互动性提示
    content += "你觉得这个概念清楚吗?如果有任何疑问都可以随时提出。";

    return content;
}
