// Mock data
interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
}

const data: Shaer[] = [
  {
    shaer: "Shaer 1",
    sherHead: ["line 1", "line 2"],
    wholeSher: ["multiple", "lines", "here"],
  },
  {
    shaer: "Shaer 2",
    sherHead: ["another", "example"],
    wholeSher: ["of", "data"],
  },
  {
    shaer: "Shaer 2",
    sherHead: ["example 2", "for checking it"],
    wholeSher: ["of", "data"],
  },
  // Add more data as needed
];

// Utility functions

// Get all shaers
export const getAllShaers = (): Shaer[] => {
  return data;
};

// Get shaer by name
export const getShaerByName = (name: string): Shaer | undefined => {
  return data.find((shaer) => shaer.shaer === name);
};

// Add a new shaer
export const addShaer = (newShaer: Shaer): void => {
  data.push(newShaer);
};

// Update a shaer by name
export const updateShaerByName = (name: string, updatedShaer: Shaer): void => {
  const index = data.findIndex((shaer) => shaer.shaer === name);
  if (index !== -1) {
    data[index] = updatedShaer;
  }
};

// Delete a shaer by name
export const deleteShaerByName = (name: string): void => {
  const index = data.findIndex((shaer) => shaer.shaer === name);
  if (index !== -1) {
    data.splice(index, 1);
  }
};
export function map(arg0: (shaerData: any, index: string) => import("react").JSX.Element): import("react").ReactNode {
  throw new Error("Function not implemented.");
}

