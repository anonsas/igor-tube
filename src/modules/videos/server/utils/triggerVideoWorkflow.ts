import { workflow } from "@/lib/workflow";

type WorkflowName = "title" | "description" | "thumbnail";
type WorkflowPayload = { userId: string; videoId: string; prompt?: string };

export async function triggerVideoWorkflow(type: WorkflowName, payload: WorkflowPayload) {
  const { workflowRunId } = await workflow.trigger({
    url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/${type}`,
    body: payload,
  });

  return workflowRunId;
}
