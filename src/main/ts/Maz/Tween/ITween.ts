interface ITween {
    easing: IRecord<Easing>;
    effect: IRecord<Effect>;
    durationMillis: number;
    repeat?: boolean;
    bounce?: boolean;
}