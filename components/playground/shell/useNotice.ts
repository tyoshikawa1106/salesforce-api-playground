import { useCallback, useEffect, useRef, useState } from "react";
import type { Notice } from "../utils/types";

export function useNotice() {
    const [notice, setNotice] = useState<Notice | null>(null);
    const noticeTimer = useRef<number | null>(null);

    const showNotice = useCallback((nextNotice: Notice) => {
        if (noticeTimer.current !== null) {
            window.clearTimeout(noticeTimer.current);
        }
        setNotice(nextNotice);
        noticeTimer.current = window.setTimeout(() => {
            setNotice(null);
            noticeTimer.current = null;
        }, 5000);
    }, []);

    useEffect(() => {
        return () => {
            if (noticeTimer.current !== null) {
                window.clearTimeout(noticeTimer.current);
            }
        };
    }, []);

    return { notice, showNotice };
}
