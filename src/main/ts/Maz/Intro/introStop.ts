function introStop(state: IIntroState, e: Element) {
    // hide the intro screen
    var intro = document.getElementById('intro');
    intro.setAttribute('class', 'hidden');
}