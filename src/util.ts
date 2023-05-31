import { existsSync, mkdirSync, writeFileSync } from 'fs';

export const fetchData = () => {
  return fetch('https://api.github.com/repositories/19438/commits')
    .then((res) => res.json())
    .catch((err) => {
      console.log('Error in fetch all data: ', err);
      return false;
    });
};

export const saveToCSV = (
  fileName: string,
  columnNames: string,
  data: string,
) => {
  try {
    if (!existsSync('./out')) {
      mkdirSync('./out');
    }
    writeFileSync(`./out/${fileName}.csv`, `${columnNames}\n${data}`, {
      encoding: 'utf8',
      flag: 'w',
    });
  } catch (err) {
    console.error('Error in save csv: ', err);
  }
};

export const convertColumnName = (arr: object[], prop?: string) =>
  Object.keys(prop ? arr[0][prop] : arr[0]).join();
export const convertToRows = (arr: object[]) =>
  arr.map((k) => Object.values(k).join()).join('\n');
export const arrayFetch = (arr: any[], prop: string) =>
  arr.map((data) => fetch(data[prop]).then((r) => r.json()));
