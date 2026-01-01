export const exportDataForAI = (attendance, gymLogs) => {
    const data = {
      metadata: {
        generated_at: new Date().toISOString(),
        user_goal: "Track academic and fitness progress"
      },
      academic_performance: attendance,
      gym_progress: gymLogs
    };
  
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axis_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };