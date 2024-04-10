import { useState, useEffect } from 'react';

interface ClickedOutside {
    isClickedOutside: boolean;
    node: Node | null;
}
export const useClickedOutside = (): ClickedOutside => {
    const [isClickedOutside, setIsClickedOutside] = useState(false);
    const [node, setNode] = useState<Node | null>(null);
    const downHandler = (e: MouseEvent) => {
        setIsClickedOutside(true);
        setNode(e.target as Node);
    };

    const upHandler = () => {
        setIsClickedOutside(false);
        setNode(null);
    };
    useEffect(() => {
        document.addEventListener('mousedown', downHandler);
        document.addEventListener('mouseup', upHandler);
        return () => {
            document.removeEventListener('mousedown', downHandler);
            document.removeEventListener('mouseup', upHandler);
        };
    }, []);

    return { isClickedOutside, node };
};
