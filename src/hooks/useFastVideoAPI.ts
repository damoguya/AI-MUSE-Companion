import { useState } from "react";

export function useFastVideoAPI(token: string) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (payload: any) => {
    console.log("[FastVideo API CLIENT] generate() called with payload:", payload);
    setLoading(true);
    setError(null);
    setTaskId(null);
    setTaskStatus(null);
    setTaskResult(null);

    try {
      console.log("[FastVideo API CLIENT] sending POST to /api/fastvideo/generation, token:", token || "EMPTY");
      const res = await fetch(`/api/fastvideo/generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log("[FastVideo API CLIENT] received response with status:", res.status);
      const data = await res.json();
      console.log("[FastVideo API CLIENT] received response body:", data);
      
      if (!res.ok) {
         const errMsg = typeof data.error === "object" ? JSON.stringify(data.error) : (data.error || data.message || "Failed to generate video task");
         throw new Error(errMsg);
      }

      // Looking for task ID from root or nested data wrapper
      let id = data.task_id || data.id || data.taskId || data.data?.task_id || data.data?.id || data.data?.taskId;
      console.log("[FastVideo API CLIENT] Parsed Task ID:", id);

      if (id) {
        setTaskId(id);
        pollTask(id);
      } else {
        setTaskResult(data);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[FastVideo API CLIENT] Error caught in generate():", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const pollTask = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 5 seconds * 120 = 10 mins

    const check = async () => {
      try {
        const res = await fetch(`/api/fastvideo/generation/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const responseData = await res.json();
        
        if (!res.ok) {
           const errMsg = typeof responseData.error === "object" ? JSON.stringify(responseData.error) : (responseData.error || responseData.message || "Failed to query video status");
           setError(errMsg);
           setLoading(false);
           return;
        }

        const status = responseData.data?.status?.toUpperCase?.() || 
                       responseData.status?.toUpperCase?.() || 
                       responseData.data?.data?.status?.toUpperCase?.() || 
                       "UNKNOWN";
        setTaskStatus(status);

        if (status === "SUCCESS" || status === "COMPLETED" || status === "SUCCEEDED") {
          setTaskResult(responseData);
          setLoading(false);
        } else if (status === "FAILED" || status === "ERROR") {
          setError("Task execution failed");
          setTaskResult(responseData);
          setLoading(false);
        } else {
          // Still processing
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(check, 5000);
          } else {
            setError("Task timeout");
            setLoading(false);
          }
        }
      } catch (err: any) {
         setError(err.message);
         setLoading(false);
      }
    };

    setTimeout(check, 3000); // initial check after 3s
  };

  return { generate, taskId, taskStatus, taskResult, loading, error };
}
