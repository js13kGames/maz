interface ITween {
    easing: IEasingRecord;
    effect: IRecord<Effect>;
    durationMillis: number;
    repeat?: boolean;
}