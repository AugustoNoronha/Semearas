export type Category = 'ANIMAL' | 'GENETIC_MATERIAL';
export type Sex = 'MALE' | 'FEMALE' | 'GELDING' | 'UNKNOWN';
export type GeneticType = 'SEMEN' | 'EMBRYO' | 'OOCYTE' | 'COVERING' | 'OTHER';
export type CatalogItem = {
  id: string; category: Category; name: string; species: string; breed: string | null;
  registryNumber: string | null; city: string | null; state: string | null; description: string | null;
  sex: Sex | null; birthDate: string | null; geneticType: GeneticType | null;
  sourceAnimal: string | null; quantity: number | null; createdAt: string; updatedAt: string;
};
export type ItemPage = { content: CatalogItem[]; totalElements: number; page: number; size: number };
export const categoryLabels: Record<Category, string> = { ANIMAL: 'Animal', GENETIC_MATERIAL: 'Material genético' };
export const sexLabels: Record<Sex, string> = { MALE: 'Macho', FEMALE: 'Fêmea', GELDING: 'Castrado', UNKNOWN: 'Não informado' };
export const geneticLabels: Record<GeneticType, string> = { SEMEN: 'Sêmen', EMBRYO: 'Embrião', OOCYTE: 'Oócito', COVERING: 'Cobertura', OTHER: 'Outro' };
export const brazilStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
