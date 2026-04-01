export interface TrialStatus{trial_status:'none';trial_ends_at:null;}
export function useTrialStatus(_o:{enabled?:boolean}={}){return{data:{trial_status:'none' as const,trial_ends_at:null},isLoading:false};}
export function useCancelTrial(){return{mutateAsync:async()=>{},isPending:false};}
