import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Action, ActivityDay, Agent, AgentStats, AgentUpdate, CommandInput, CommandResult, Conversation, ConversationInput, ConversationWithMessages, HealthStatus, Integration, IntegrationUpdate, ListActionsParams, ListMemoryParams, ListTasksParams, MemoryEntry, MemoryInput, MemoryUpdate, MessageInput, OAuthConnectResult, OpenaiMessageInput, ShellSession, ShellSessionInput, ShellSessionWithHistory, Task, TaskInput, TaskSummary, TaskUpdate, Workflow, WorkflowInput, WorkflowUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAgentUrl: () => string;
/**
 * @summary Get agent profile and status
 */
export declare const getAgent: (options?: RequestInit) => Promise<Agent>;
export declare const getGetAgentQueryKey: () => readonly ["/api/agent"];
export declare const getGetAgentQueryOptions: <TData = Awaited<ReturnType<typeof getAgent>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAgent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAgent>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAgentQueryResult = NonNullable<Awaited<ReturnType<typeof getAgent>>>;
export type GetAgentQueryError = ErrorType<unknown>;
/**
 * @summary Get agent profile and status
 */
export declare function useGetAgent<TData = Awaited<ReturnType<typeof getAgent>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAgent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAgentUrl: () => string;
/**
 * @summary Update agent configuration
 */
export declare const updateAgent: (agentUpdate: AgentUpdate, options?: RequestInit) => Promise<Agent>;
export declare const getUpdateAgentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAgent>>, TError, {
        data: BodyType<AgentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAgent>>, TError, {
    data: BodyType<AgentUpdate>;
}, TContext>;
export type UpdateAgentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAgent>>>;
export type UpdateAgentMutationBody = BodyType<AgentUpdate>;
export type UpdateAgentMutationError = ErrorType<unknown>;
/**
* @summary Update agent configuration
*/
export declare const useUpdateAgent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAgent>>, TError, {
        data: BodyType<AgentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAgent>>, TError, {
    data: BodyType<AgentUpdate>;
}, TContext>;
export declare const getGetAgentStatsUrl: () => string;
/**
 * @summary Get agent activity statistics
 */
export declare const getAgentStats: (options?: RequestInit) => Promise<AgentStats>;
export declare const getGetAgentStatsQueryKey: () => readonly ["/api/agent/stats"];
export declare const getGetAgentStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAgentStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAgentStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAgentStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAgentStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAgentStats>>>;
export type GetAgentStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get agent activity statistics
 */
export declare function useGetAgentStats<TData = Awaited<ReturnType<typeof getAgentStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAgentStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListConversationsUrl: () => string;
/**
 * @summary List all conversations
 */
export declare const listConversations: (options?: RequestInit) => Promise<Conversation[]>;
export declare const getListConversationsQueryKey: () => readonly ["/api/conversations"];
export declare const getListConversationsQueryOptions: <TData = Awaited<ReturnType<typeof listConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof listConversations>>>;
export type ListConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List all conversations
 */
export declare function useListConversations<TData = Awaited<ReturnType<typeof listConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateConversationUrl: () => string;
/**
 * @summary Start a new conversation
 */
export declare const createConversation: (conversationInput: ConversationInput, options?: RequestInit) => Promise<Conversation>;
export declare const getCreateConversationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createConversation>>, TError, {
        data: BodyType<ConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createConversation>>, TError, {
    data: BodyType<ConversationInput>;
}, TContext>;
export type CreateConversationMutationResult = NonNullable<Awaited<ReturnType<typeof createConversation>>>;
export type CreateConversationMutationBody = BodyType<ConversationInput>;
export type CreateConversationMutationError = ErrorType<unknown>;
/**
* @summary Start a new conversation
*/
export declare const useCreateConversation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createConversation>>, TError, {
        data: BodyType<ConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createConversation>>, TError, {
    data: BodyType<ConversationInput>;
}, TContext>;
export declare const getGetConversationUrl: (id: number) => string;
/**
 * @summary Get a conversation with its messages
 */
export declare const getConversation: (id: number, options?: RequestInit) => Promise<ConversationWithMessages>;
export declare const getGetConversationQueryKey: (id: number) => readonly [`/api/conversations/${number}`];
export declare const getGetConversationQueryOptions: <TData = Awaited<ReturnType<typeof getConversation>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getConversation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetConversationQueryResult = NonNullable<Awaited<ReturnType<typeof getConversation>>>;
export type GetConversationQueryError = ErrorType<unknown>;
/**
 * @summary Get a conversation with its messages
 */
export declare function useGetConversation<TData = Awaited<ReturnType<typeof getConversation>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeleteConversationUrl: (id: number) => string;
/**
 * @summary Delete a conversation
 */
export declare const deleteConversation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteConversationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteConversation>>, TError, {
    id: number;
}, TContext>;
export type DeleteConversationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteConversation>>>;
export type DeleteConversationMutationError = ErrorType<unknown>;
/**
* @summary Delete a conversation
*/
export declare const useDeleteConversation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteConversation>>, TError, {
    id: number;
}, TContext>;
export declare const getSendMessageUrl: (id: number) => string;
/**
 * @summary Send a message (streams SSE)
 */
export declare const sendMessage: (id: number, messageInput: MessageInput, options?: RequestInit) => Promise<string>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message (streams SSE)
*/
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<MessageInput>;
}, TContext>;
export declare const getListTasksUrl: (params?: ListTasksParams) => string;
/**
 * @summary List all tasks
 */
export declare const listTasks: (params?: ListTasksParams, options?: RequestInit) => Promise<Task[]>;
export declare const getListTasksQueryKey: (params?: ListTasksParams) => readonly ["/api/tasks", ...ListTasksParams[]];
export declare const getListTasksQueryOptions: <TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listTasks>>>;
export type ListTasksQueryError = ErrorType<unknown>;
/**
 * @summary List all tasks
 */
export declare function useListTasks<TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTaskUrl: () => string;
/**
 * @summary Create a new task for ARIA
 */
export declare const createTask: (taskInput: TaskInput, options?: RequestInit) => Promise<Task>;
export declare const getCreateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export type CreateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createTask>>>;
export type CreateTaskMutationBody = BodyType<TaskInput>;
export type CreateTaskMutationError = ErrorType<unknown>;
/**
* @summary Create a new task for ARIA
*/
export declare const useCreateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export declare const getGetTaskUrl: (id: number) => string;
/**
 * @summary Get a task by ID
 */
export declare const getTask: (id: number, options?: RequestInit) => Promise<Task>;
export declare const getGetTaskQueryKey: (id: number) => readonly [`/api/tasks/${number}`];
export declare const getGetTaskQueryOptions: <TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getTask>>>;
export type GetTaskQueryError = ErrorType<unknown>;
/**
 * @summary Get a task by ID
 */
export declare function useGetTask<TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateTaskUrl: (id: number) => string;
/**
 * @summary Update a task
 */
export declare const updateTask: (id: number, taskUpdate: TaskUpdate, options?: RequestInit) => Promise<Task>;
export declare const getUpdateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
        id: number;
        data: BodyType<TaskUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
    id: number;
    data: BodyType<TaskUpdate>;
}, TContext>;
export type UpdateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof updateTask>>>;
export type UpdateTaskMutationBody = BodyType<TaskUpdate>;
export type UpdateTaskMutationError = ErrorType<unknown>;
/**
* @summary Update a task
*/
export declare const useUpdateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
        id: number;
        data: BodyType<TaskUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTask>>, TError, {
    id: number;
    data: BodyType<TaskUpdate>;
}, TContext>;
export declare const getDeleteTaskUrl: (id: number) => string;
/**
 * @summary Delete a task
 */
export declare const deleteTask: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
    id: number;
}, TContext>;
export type DeleteTaskMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTask>>>;
export type DeleteTaskMutationError = ErrorType<unknown>;
/**
* @summary Delete a task
*/
export declare const useDeleteTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTask>>, TError, {
    id: number;
}, TContext>;
export declare const getGetTaskSummaryUrl: () => string;
/**
 * @summary Get task counts grouped by status
 */
export declare const getTaskSummary: (options?: RequestInit) => Promise<TaskSummary>;
export declare const getGetTaskSummaryQueryKey: () => readonly ["/api/tasks/summary"];
export declare const getGetTaskSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getTaskSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTaskSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getTaskSummary>>>;
export type GetTaskSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get task counts grouped by status
 */
export declare function useGetTaskSummary<TData = Awaited<ReturnType<typeof getTaskSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListShellSessionsUrl: () => string;
/**
 * @summary List shell sessions
 */
export declare const listShellSessions: (options?: RequestInit) => Promise<ShellSession[]>;
export declare const getListShellSessionsQueryKey: () => readonly ["/api/shell/sessions"];
export declare const getListShellSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listShellSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listShellSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listShellSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListShellSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listShellSessions>>>;
export type ListShellSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List shell sessions
 */
export declare function useListShellSessions<TData = Awaited<ReturnType<typeof listShellSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listShellSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateShellSessionUrl: () => string;
/**
 * @summary Create a new shell session
 */
export declare const createShellSession: (shellSessionInput: ShellSessionInput, options?: RequestInit) => Promise<ShellSession>;
export declare const getCreateShellSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createShellSession>>, TError, {
        data: BodyType<ShellSessionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createShellSession>>, TError, {
    data: BodyType<ShellSessionInput>;
}, TContext>;
export type CreateShellSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createShellSession>>>;
export type CreateShellSessionMutationBody = BodyType<ShellSessionInput>;
export type CreateShellSessionMutationError = ErrorType<unknown>;
/**
* @summary Create a new shell session
*/
export declare const useCreateShellSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createShellSession>>, TError, {
        data: BodyType<ShellSessionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createShellSession>>, TError, {
    data: BodyType<ShellSessionInput>;
}, TContext>;
export declare const getGetShellSessionUrl: (id: number) => string;
/**
 * @summary Get shell session with command history
 */
export declare const getShellSession: (id: number, options?: RequestInit) => Promise<ShellSessionWithHistory>;
export declare const getGetShellSessionQueryKey: (id: number) => readonly [`/api/shell/sessions/${number}`];
export declare const getGetShellSessionQueryOptions: <TData = Awaited<ReturnType<typeof getShellSession>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShellSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getShellSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetShellSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getShellSession>>>;
export type GetShellSessionQueryError = ErrorType<unknown>;
/**
 * @summary Get shell session with command history
 */
export declare function useGetShellSession<TData = Awaited<ReturnType<typeof getShellSession>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShellSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeleteShellSessionUrl: (id: number) => string;
/**
 * @summary Close a shell session
 */
export declare const deleteShellSession: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteShellSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteShellSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteShellSession>>, TError, {
    id: number;
}, TContext>;
export type DeleteShellSessionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteShellSession>>>;
export type DeleteShellSessionMutationError = ErrorType<unknown>;
/**
* @summary Close a shell session
*/
export declare const useDeleteShellSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteShellSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteShellSession>>, TError, {
    id: number;
}, TContext>;
export declare const getExecuteCommandUrl: (id: number) => string;
/**
 * @summary Execute a command in a shell session
 */
export declare const executeCommand: (id: number, commandInput: CommandInput, options?: RequestInit) => Promise<CommandResult>;
export declare const getExecuteCommandMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof executeCommand>>, TError, {
        id: number;
        data: BodyType<CommandInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof executeCommand>>, TError, {
    id: number;
    data: BodyType<CommandInput>;
}, TContext>;
export type ExecuteCommandMutationResult = NonNullable<Awaited<ReturnType<typeof executeCommand>>>;
export type ExecuteCommandMutationBody = BodyType<CommandInput>;
export type ExecuteCommandMutationError = ErrorType<unknown>;
/**
* @summary Execute a command in a shell session
*/
export declare const useExecuteCommand: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof executeCommand>>, TError, {
        id: number;
        data: BodyType<CommandInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof executeCommand>>, TError, {
    id: number;
    data: BodyType<CommandInput>;
}, TContext>;
export declare const getListIntegrationsUrl: () => string;
/**
 * @summary List all available integrations and their connection status
 */
export declare const listIntegrations: (options?: RequestInit) => Promise<Integration[]>;
export declare const getListIntegrationsQueryKey: () => readonly ["/api/integrations"];
export declare const getListIntegrationsQueryOptions: <TData = Awaited<ReturnType<typeof listIntegrations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIntegrations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listIntegrations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListIntegrationsQueryResult = NonNullable<Awaited<ReturnType<typeof listIntegrations>>>;
export type ListIntegrationsQueryError = ErrorType<unknown>;
/**
 * @summary List all available integrations and their connection status
 */
export declare function useListIntegrations<TData = Awaited<ReturnType<typeof listIntegrations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIntegrations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntegrationUrl: (id: number) => string;
/**
 * @summary Get integration details
 */
export declare const getIntegration: (id: number, options?: RequestInit) => Promise<Integration>;
export declare const getGetIntegrationQueryKey: (id: number) => readonly [`/api/integrations/${number}`];
export declare const getGetIntegrationQueryOptions: <TData = Awaited<ReturnType<typeof getIntegration>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntegration>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntegration>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof getIntegration>>>;
export type GetIntegrationQueryError = ErrorType<unknown>;
/**
 * @summary Get integration details
 */
export declare function useGetIntegration<TData = Awaited<ReturnType<typeof getIntegration>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntegration>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateIntegrationUrl: (id: number) => string;
/**
 * @summary Update integration settings
 */
export declare const updateIntegration: (id: number, integrationUpdate: IntegrationUpdate, options?: RequestInit) => Promise<Integration>;
export declare const getUpdateIntegrationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIntegration>>, TError, {
        id: number;
        data: BodyType<IntegrationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIntegration>>, TError, {
    id: number;
    data: BodyType<IntegrationUpdate>;
}, TContext>;
export type UpdateIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof updateIntegration>>>;
export type UpdateIntegrationMutationBody = BodyType<IntegrationUpdate>;
export type UpdateIntegrationMutationError = ErrorType<unknown>;
/**
* @summary Update integration settings
*/
export declare const useUpdateIntegration: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIntegration>>, TError, {
        id: number;
        data: BodyType<IntegrationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIntegration>>, TError, {
    id: number;
    data: BodyType<IntegrationUpdate>;
}, TContext>;
export declare const getConnectIntegrationUrl: (id: number) => string;
/**
 * @summary Initiate OAuth connection for an integration
 */
export declare const connectIntegration: (id: number, options?: RequestInit) => Promise<OAuthConnectResult>;
export declare const getConnectIntegrationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectIntegration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof connectIntegration>>, TError, {
    id: number;
}, TContext>;
export type ConnectIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof connectIntegration>>>;
export type ConnectIntegrationMutationError = ErrorType<unknown>;
/**
* @summary Initiate OAuth connection for an integration
*/
export declare const useConnectIntegration: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectIntegration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof connectIntegration>>, TError, {
    id: number;
}, TContext>;
export declare const getDisconnectIntegrationUrl: (id: number) => string;
/**
 * @summary Disconnect an integration
 */
export declare const disconnectIntegration: (id: number, options?: RequestInit) => Promise<Integration>;
export declare const getDisconnectIntegrationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disconnectIntegration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof disconnectIntegration>>, TError, {
    id: number;
}, TContext>;
export type DisconnectIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof disconnectIntegration>>>;
export type DisconnectIntegrationMutationError = ErrorType<unknown>;
/**
* @summary Disconnect an integration
*/
export declare const useDisconnectIntegration: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disconnectIntegration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof disconnectIntegration>>, TError, {
    id: number;
}, TContext>;
export declare const getListMemoryUrl: (params?: ListMemoryParams) => string;
/**
 * @summary List all memory entries
 */
export declare const listMemory: (params?: ListMemoryParams, options?: RequestInit) => Promise<MemoryEntry[]>;
export declare const getListMemoryQueryKey: (params?: ListMemoryParams) => readonly ["/api/memory", ...ListMemoryParams[]];
export declare const getListMemoryQueryOptions: <TData = Awaited<ReturnType<typeof listMemory>>, TError = ErrorType<unknown>>(params?: ListMemoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMemory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMemory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMemoryQueryResult = NonNullable<Awaited<ReturnType<typeof listMemory>>>;
export type ListMemoryQueryError = ErrorType<unknown>;
/**
 * @summary List all memory entries
 */
export declare function useListMemory<TData = Awaited<ReturnType<typeof listMemory>>, TError = ErrorType<unknown>>(params?: ListMemoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMemory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMemoryEntryUrl: () => string;
/**
 * @summary Store a new memory entry
 */
export declare const createMemoryEntry: (memoryInput: MemoryInput, options?: RequestInit) => Promise<MemoryEntry>;
export declare const getCreateMemoryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMemoryEntry>>, TError, {
        data: BodyType<MemoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMemoryEntry>>, TError, {
    data: BodyType<MemoryInput>;
}, TContext>;
export type CreateMemoryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof createMemoryEntry>>>;
export type CreateMemoryEntryMutationBody = BodyType<MemoryInput>;
export type CreateMemoryEntryMutationError = ErrorType<unknown>;
/**
* @summary Store a new memory entry
*/
export declare const useCreateMemoryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMemoryEntry>>, TError, {
        data: BodyType<MemoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMemoryEntry>>, TError, {
    data: BodyType<MemoryInput>;
}, TContext>;
export declare const getUpdateMemoryEntryUrl: (id: number) => string;
/**
 * @summary Update a memory entry
 */
export declare const updateMemoryEntry: (id: number, memoryUpdate: MemoryUpdate, options?: RequestInit) => Promise<MemoryEntry>;
export declare const getUpdateMemoryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMemoryEntry>>, TError, {
        id: number;
        data: BodyType<MemoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMemoryEntry>>, TError, {
    id: number;
    data: BodyType<MemoryUpdate>;
}, TContext>;
export type UpdateMemoryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof updateMemoryEntry>>>;
export type UpdateMemoryEntryMutationBody = BodyType<MemoryUpdate>;
export type UpdateMemoryEntryMutationError = ErrorType<unknown>;
/**
* @summary Update a memory entry
*/
export declare const useUpdateMemoryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMemoryEntry>>, TError, {
        id: number;
        data: BodyType<MemoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMemoryEntry>>, TError, {
    id: number;
    data: BodyType<MemoryUpdate>;
}, TContext>;
export declare const getDeleteMemoryEntryUrl: (id: number) => string;
/**
 * @summary Delete a memory entry
 */
export declare const deleteMemoryEntry: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMemoryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMemoryEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMemoryEntry>>, TError, {
    id: number;
}, TContext>;
export type DeleteMemoryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMemoryEntry>>>;
export type DeleteMemoryEntryMutationError = ErrorType<unknown>;
/**
* @summary Delete a memory entry
*/
export declare const useDeleteMemoryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMemoryEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMemoryEntry>>, TError, {
    id: number;
}, TContext>;
export declare const getListActionsUrl: (params?: ListActionsParams) => string;
/**
 * @summary List recent actions taken by ARIA
 */
export declare const listActions: (params?: ListActionsParams, options?: RequestInit) => Promise<Action[]>;
export declare const getListActionsQueryKey: (params?: ListActionsParams) => readonly ["/api/actions", ...ListActionsParams[]];
export declare const getListActionsQueryOptions: <TData = Awaited<ReturnType<typeof listActions>>, TError = ErrorType<unknown>>(params?: ListActionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listActions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListActionsQueryResult = NonNullable<Awaited<ReturnType<typeof listActions>>>;
export type ListActionsQueryError = ErrorType<unknown>;
/**
 * @summary List recent actions taken by ARIA
 */
export declare function useListActions<TData = Awaited<ReturnType<typeof listActions>>, TError = ErrorType<unknown>>(params?: ListActionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetActivityFeedUrl: () => string;
/**
 * @summary Get recent activity feed grouped by day
 */
export declare const getActivityFeed: (options?: RequestInit) => Promise<ActivityDay[]>;
export declare const getGetActivityFeedQueryKey: () => readonly ["/api/actions/feed"];
export declare const getGetActivityFeedQueryOptions: <TData = Awaited<ReturnType<typeof getActivityFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActivityFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActivityFeed>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActivityFeedQueryResult = NonNullable<Awaited<ReturnType<typeof getActivityFeed>>>;
export type GetActivityFeedQueryError = ErrorType<unknown>;
/**
 * @summary Get recent activity feed grouped by day
 */
export declare function useGetActivityFeed<TData = Awaited<ReturnType<typeof getActivityFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActivityFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListWorkflowsUrl: () => string;
/**
 * @summary List all automated workflows
 */
export declare const listWorkflows: (options?: RequestInit) => Promise<Workflow[]>;
export declare const getListWorkflowsQueryKey: () => readonly ["/api/workflows"];
export declare const getListWorkflowsQueryOptions: <TData = Awaited<ReturnType<typeof listWorkflows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWorkflows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listWorkflows>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListWorkflowsQueryResult = NonNullable<Awaited<ReturnType<typeof listWorkflows>>>;
export type ListWorkflowsQueryError = ErrorType<unknown>;
/**
 * @summary List all automated workflows
 */
export declare function useListWorkflows<TData = Awaited<ReturnType<typeof listWorkflows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWorkflows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateWorkflowUrl: () => string;
/**
 * @summary Create a new automated workflow
 */
export declare const createWorkflow: (workflowInput: WorkflowInput, options?: RequestInit) => Promise<Workflow>;
export declare const getCreateWorkflowMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkflow>>, TError, {
        data: BodyType<WorkflowInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWorkflow>>, TError, {
    data: BodyType<WorkflowInput>;
}, TContext>;
export type CreateWorkflowMutationResult = NonNullable<Awaited<ReturnType<typeof createWorkflow>>>;
export type CreateWorkflowMutationBody = BodyType<WorkflowInput>;
export type CreateWorkflowMutationError = ErrorType<unknown>;
/**
* @summary Create a new automated workflow
*/
export declare const useCreateWorkflow: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkflow>>, TError, {
        data: BodyType<WorkflowInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWorkflow>>, TError, {
    data: BodyType<WorkflowInput>;
}, TContext>;
export declare const getGetWorkflowUrl: (id: number) => string;
/**
 * @summary Get a workflow by ID
 */
export declare const getWorkflow: (id: number, options?: RequestInit) => Promise<Workflow>;
export declare const getGetWorkflowQueryKey: (id: number) => readonly [`/api/workflows/${number}`];
export declare const getGetWorkflowQueryOptions: <TData = Awaited<ReturnType<typeof getWorkflow>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkflow>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWorkflow>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWorkflowQueryResult = NonNullable<Awaited<ReturnType<typeof getWorkflow>>>;
export type GetWorkflowQueryError = ErrorType<unknown>;
/**
 * @summary Get a workflow by ID
 */
export declare function useGetWorkflow<TData = Awaited<ReturnType<typeof getWorkflow>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkflow>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateWorkflowUrl: (id: number) => string;
/**
 * @summary Update a workflow
 */
export declare const updateWorkflow: (id: number, workflowUpdate: WorkflowUpdate, options?: RequestInit) => Promise<Workflow>;
export declare const getUpdateWorkflowMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkflow>>, TError, {
        id: number;
        data: BodyType<WorkflowUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateWorkflow>>, TError, {
    id: number;
    data: BodyType<WorkflowUpdate>;
}, TContext>;
export type UpdateWorkflowMutationResult = NonNullable<Awaited<ReturnType<typeof updateWorkflow>>>;
export type UpdateWorkflowMutationBody = BodyType<WorkflowUpdate>;
export type UpdateWorkflowMutationError = ErrorType<unknown>;
/**
* @summary Update a workflow
*/
export declare const useUpdateWorkflow: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkflow>>, TError, {
        id: number;
        data: BodyType<WorkflowUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateWorkflow>>, TError, {
    id: number;
    data: BodyType<WorkflowUpdate>;
}, TContext>;
export declare const getDeleteWorkflowUrl: (id: number) => string;
/**
 * @summary Delete a workflow
 */
export declare const deleteWorkflow: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteWorkflowMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteWorkflow>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteWorkflow>>, TError, {
    id: number;
}, TContext>;
export type DeleteWorkflowMutationResult = NonNullable<Awaited<ReturnType<typeof deleteWorkflow>>>;
export type DeleteWorkflowMutationError = ErrorType<unknown>;
/**
* @summary Delete a workflow
*/
export declare const useDeleteWorkflow: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteWorkflow>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteWorkflow>>, TError, {
    id: number;
}, TContext>;
export declare const getToggleWorkflowUrl: (id: number) => string;
/**
 * @summary Enable or disable a workflow
 */
export declare const toggleWorkflow: (id: number, options?: RequestInit) => Promise<Workflow>;
export declare const getToggleWorkflowMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleWorkflow>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof toggleWorkflow>>, TError, {
    id: number;
}, TContext>;
export type ToggleWorkflowMutationResult = NonNullable<Awaited<ReturnType<typeof toggleWorkflow>>>;
export type ToggleWorkflowMutationError = ErrorType<unknown>;
/**
* @summary Enable or disable a workflow
*/
export declare const useToggleWorkflow: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleWorkflow>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof toggleWorkflow>>, TError, {
    id: number;
}, TContext>;
export declare const getSendOpenaiMessageUrl: (id: number) => string;
/**
 * @summary Send a message and receive streamed AI response
 */
export declare const sendOpenaiMessage: (id: number, openaiMessageInput: OpenaiMessageInput, options?: RequestInit) => Promise<string>;
export declare const getSendOpenaiMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
        id: number;
        data: BodyType<OpenaiMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
    id: number;
    data: BodyType<OpenaiMessageInput>;
}, TContext>;
export type SendOpenaiMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendOpenaiMessage>>>;
export type SendOpenaiMessageMutationBody = BodyType<OpenaiMessageInput>;
export type SendOpenaiMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message and receive streamed AI response
*/
export declare const useSendOpenaiMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
        id: number;
        data: BodyType<OpenaiMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
    id: number;
    data: BodyType<OpenaiMessageInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map