import axios, { endpoints } from "src/utils/axios";

export async function createDoc(data: any) {
  const URL = endpoints.document.new(data.name);
  await axios.post(`${URL}`, data);
}
