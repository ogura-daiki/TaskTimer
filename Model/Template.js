import { createId } from "../libs/ModelUtil.js";

const newTemplate = (label, name, memo="") => {
  return {
    id: createId(),
    label,
    name,
    memo,
  };
};

export {
  newTemplate,
}