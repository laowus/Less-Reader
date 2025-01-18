export const useIpcRenderer = () => {
    try {
        return electronAPI ? electronAPI.ipcRenderer : null
    } catch (error) {
        //Do Nothing
    }
    return null
}

