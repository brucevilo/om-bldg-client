// notificationが持っているDataというjson型データのerrorCaseというキーの値を適宜ユーザーに分かりやすい形にコンバートする
export const convertEasyToUnderstandFromNotificationDataErrorCase = (
    errorCase: string,
): string => {
    const trimLineAndBlank = (s: string) => s.replace(/\s+/g, '');
    const converterObject: { [key: string]: string } = {
        [trimLineAndBlank(
            'その他のエラー: Unable to create instance of:<Excel.Application>\nThis is typically because you have no access to the desktop subsystem from a Windows Service/IIS module in default configuration because it is running in a restricted context/principal.',
        )]: 'エクセル編集システムが落ちている可能性があります',
    };

    return converterObject[trimLineAndBlank(errorCase)] || errorCase;
};
