function arrayRemove<T>(a: T[], e: T): void {
    let index = a.indexOf(e);
    if (index >= 0) {
        a.splice(index, 1);
    }
}