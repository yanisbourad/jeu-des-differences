
export interface card{
    title :string; 
    difficulty : number;
    rankingSolo: {name1:string, time1:number, name2 : String, time2 : number, name3: String, time3: number};
    rankingMulti :  {name1:string, time1:number, name2 : String, time2 : number, name3: String, time3: number};
    image:string
}