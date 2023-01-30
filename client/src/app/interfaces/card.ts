export interface card {
    title: string;
    difficulty: number;
    rankingSolo: { name1: string; time1: number; name2: string; time2: number; name3: string; time3: number };
    rankingMulti: { name1: string; time1: number; name2: string; time2: number; name3: string; time3: number };
    image: string;
}
