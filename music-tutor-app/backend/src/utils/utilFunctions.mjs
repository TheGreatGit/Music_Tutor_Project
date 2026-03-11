// returns a room number made from student user id and tutor user id
// it sets them in ascending order so that the room will always have the same name and avpid duplication e.g. no risk of 1252 and 5212
export const generateRoomNumber = (a,b)=>{
    const x = Number(a);
    const y = Number(b);

    const min = Math.min(x,y);
    const max = Math.max(x,y);

    return `${min}:${max}`;
}