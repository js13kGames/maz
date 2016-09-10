function toFont(sizePx: number, bold?: boolean, fontFace = 'Georgia') {
    return (bold ? 'bold ' : '') + sizePx +'px '+fontFace;
}