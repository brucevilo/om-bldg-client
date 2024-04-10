export const alignCenter = {
    horizontal: 'center' as const,
    vertical: 'middle' as const,
};

export const alignRight = {
    ...alignCenter,
    horizontal: 'right' as const,
};

export const darkGrayFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'bfbfbf' },
};

export const grayFill = {
    ...darkGrayFill,
    fgColor: { argb: 'd8d8d8' },
};
export const whiteFill = {
    ...darkGrayFill,
    fgColor: { argb: 'ffffff' },
};

export const lightGrayFill = {
    ...darkGrayFill,
    fgColor: { argb: 'f2f2f2' },
};

export const yellowFill = {
    ...darkGrayFill,
    fgColor: { argb: 'ffff66' },
};

export const purpleFill = {
    ...darkGrayFill,
    fgColor: { argb: 'ffccff' },
};

export const greenFill = {
    ...darkGrayFill,
    fgColor: { argb: 'c5e0b3' },
};

export const lightOrangeFill = {
    ...darkGrayFill,
    fgColor: { argb: 'fbe4d5' },
};

export const defaultFont = {
    name: 'Arial',
    size: 10,
};

export const boldFont = {
    ...defaultFont,
    bold: true,
};

export const defaultBorder = {
    top: { style: 'thin' as const },
    right: { style: 'thin' as const },
    bottom: { style: 'thin' as const },
    left: { style: 'thin' as const },
};

export const whiteBorder = {
    top: { style: 'thin' as const, color: { theme: 0 } },
    right: { style: 'thin' as const, color: { theme: 0 } },
    bottom: { style: 'thin' as const, color: { theme: 0 } },
    left: { style: 'thin' as const, color: { theme: 0 } },
};
