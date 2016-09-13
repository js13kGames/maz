let BASE_CHARACTER_AFFINITIES: { [_: string]: string } = {
    // monsters
    'a': 'Aàâãäåæª',
    //'b': 'BÞЬ',
    'c': 'Cćĉċč¢ç©eo',
    'e': 'Eæèêëèêëc',
    //'f': 'Fƒ',
    'g': 'Gĝğġģ',
    //'h': 'Hĥħ',
    'i': 'Iìîïĩīĭįıĳjΐ',
    //'j': 'Jĳi',
    'k': 'Kķx',
    //'l': 'Lℓ',
    //'m': 'M™',
    'n': 'NńņňŉŋU',
    'o': 'Oōŏőœǿòôõöð®©',
    //'p': 'P',
    'r': 'R®ŕŗřn',
    's': 'Sșśŝşšz',
    't': 'T™ţťŧț',
    //'v': 'Vu',
    //'w': 'Wmψ',
    'x': 'X×+',
    //'y': 'Yŷλ',
    'z': 'Zźżž',
    'A': 'ÀÂÃÄÅÆĀĂĄД',
    'B': '83βDE',
    'C': 'ĆĈĊČ€c(',
    //'D': 'ĎĐ',
    'E': 'ЁĒĔĖĘĚFΣε', 
    //'F': 'E', 
    'G': 'ĜĞĠĢC', 
    'H': 'ĦĤЊA', 
    'I': 'ĨĪĬĮİĲ1', 
    //'J': 'Ĵ', 
    'K': 'ĶĸB', 
    //'L': 'ĹĻĽĿŁ', 
    //'M': 'N', 
    'N': 'ŇŃŅŇŊ',
    'O': 'ŒǾŌŎŐ☻☺Ω☼♀ФQ', 
    //'P': 'R', 
    //'Q': 'O', 
    'R': 'ŔŖŘ', 
    'S': '$Ș', 
    'T': 'ŢŤŦȚ♣', 
    //'U': 'ůűųŨŪŬŮŰŲЏ', 
    //'V': 'U', 
    //'W': 'ŴẀẄЩШ', 
    //'X': 'жy', 
    //'Y': 'Ϋ¥ŶŸỲ', 
    'Z': 'ŻŽŹŻŽS',
    'ε': 'έ',
    'Њ': 'bњ',
    '(': '[{',
    // collectables
    '.': ',"!΅:˚●',
    ':': ';', 
    ',': ';', 
    '˚': '^', 
    '΅': '~',
    '!': '‼?',
    '?': '',
    '^': '▲♦', 
    '♦': '♥*',
    // walls 
    '#': '=‡≡', 
    '%': '&E#', 
    '≡': '=÷Ξ',
    '⁞': '…÷:',
    '=': '≠÷',
    '‡': '†',
    '†': '+‡',
    '+': '-±',
    '-': '÷±',
    '&': '£',
    '£': '₤',
};

function calculateCharacterAffinities(): { [_: string]: string } {
    let result: { [_: string]: string } = {};

    function append(key: string, characters: string) {
        let existingCharacters = result[key];
        if (!existingCharacters) {
            existingCharacters = characters;
        } else {
            for (let i = 0; i < characters.length; i++) {
                let character = characters.charAt(i);
                if (existingCharacters.indexOf(character) < 0) {
                    existingCharacters += character;
                }
            }
        }
        result[key] = existingCharacters;
        return existingCharacters;
    }

    // calculate two-way affinities
    for (let key in BASE_CHARACTER_AFFINITIES) {
        let characters = BASE_CHARACTER_AFFINITIES[key];
        let existingCharacters = append(key, characters);
        // map the reverse
        for (let i = 0; i < existingCharacters.length; i++) {
            let existingCharacter = existingCharacters.charAt(i);
            append(existingCharacter, key);
        }
    }

    return result;
}