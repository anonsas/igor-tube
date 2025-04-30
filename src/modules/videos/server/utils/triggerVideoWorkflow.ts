import { workflow } from "@/lib/workflow";

type WorkflowName = "title" | "description" | "thumbnail";

export async function triggerVideoWorkflow(type: WorkflowName, userId: string, videoId: string) {
  const { workflowRunId } = await workflow.trigger({
    url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/${type}`,
    body: { userId, videoId },
  });

  return workflowRunId;
}
