export interface CollegeData {
  rank: number;
  name: string;
  annualTuition: number;
  annualRoomBoard: number;
  medianSalary: number;
}

export const colleges: CollegeData[] = [
  { rank: 1, name: "Princeton University", annualTuition: 62400, annualRoomBoard: 20600, medianSalary: 93000 },
  { rank: 2, name: "Massachusetts Institute of Technology", annualTuition: 63000, annualRoomBoard: 20500, medianSalary: 106000 },
  { rank: 3, name: "Harvard University", annualTuition: 59000, annualRoomBoard: 21000, medianSalary: 91000 },
  { rank: 4, name: "Stanford University", annualTuition: 65000, annualRoomBoard: 21000, medianSalary: 98000 },
  { rank: 5, name: "Yale University", annualTuition: 67500, annualRoomBoard: 20500, medianSalary: 89000 },
  { rank: 6, name: "California Institute of Technology", annualTuition: 63000, annualRoomBoard: 21000, medianSalary: 93000 },
  { rank: 7, name: "Duke University", annualTuition: 66000, annualRoomBoard: 20500, medianSalary: 84000 },
  { rank: 8, name: "Johns Hopkins University", annualTuition: 65000, annualRoomBoard: 19500, medianSalary: 75000 },
  { rank: 9, name: "Northwestern University", annualTuition: 68000, annualRoomBoard: 21000, medianSalary: 73000 },
  { rank: 10, name: "University of Pennsylvania", annualTuition: 68500, annualRoomBoard: 19500, medianSalary: 89000 },
  { rank: 11, name: "Cornell University", annualTuition: 68000, annualRoomBoard: 18000, medianSalary: 84000 },
  { rank: 12, name: "University of Chicago", annualTuition: 67000, annualRoomBoard: 19500, medianSalary: 79000 },
  { rank: 13, name: "Brown University", annualTuition: 68500, annualRoomBoard: 17500, medianSalary: 78000 },
  { rank: 14, name: "Columbia University", annualTuition: 69500, annualRoomBoard: 18500, medianSalary: 83000 },
  { rank: 15, name: "Dartmouth College", annualTuition: 67000, annualRoomBoard: 19500, medianSalary: 89000 },
  { rank: 16, name: "University of California - Los Angeles (Out-of-State)", annualTuition: 48500, annualRoomBoard: 18500, medianSalary: 75000 },
  { rank: 17, name: "University of California - Berkeley (Out-of-State)", annualTuition: 48500, annualRoomBoard: 20500, medianSalary: 88000 },
  { rank: 18, name: "Rice University", annualTuition: 61500, annualRoomBoard: 16500, medianSalary: 81000 },
  { rank: 19, name: "University of Notre Dame", annualTuition: 65500, annualRoomBoard: 18500, medianSalary: 83000 },
  { rank: 20, name: "Vanderbilt University", annualTuition: 65500, annualRoomBoard: 21500, medianSalary: 79000 }
];