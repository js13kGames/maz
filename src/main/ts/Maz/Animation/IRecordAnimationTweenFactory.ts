interface IRecordAnimationTweenFactory {
    (animationRecord: IRecord<Animation>, width: number, height: number): ITween[];
}