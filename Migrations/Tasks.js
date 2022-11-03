import { setProto } from "../libs/ModelUtil.js";
import { proto as TaskProto } from "../Model/Task.js";

const deserializer = (name, value) => {
  const patterns = [
    (name, value) => ({
      cond: ["from", "to"].includes(name),
      convert: () => new Date(value),
    }),
    (name, value) => ({
      cond: typeof value !== "object",
      convert: () => value
    }),
    (name, value) => ({
      cond: value?.type === "task",
      convert: () => setProto(value, TaskProto),
    }),
  ];
  for (const p of patterns) {
    const obj = p(name, value);
    if (obj.cond){
      return obj.convert();
    }
  }
  return value;
}

export default {
  migrations:[
    {
      v: 0,
      up: () => {
        return [];
      },
      deserializer,
    },
  ],
};