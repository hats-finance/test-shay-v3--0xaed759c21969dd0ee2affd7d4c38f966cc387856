import { TFunction } from "react-i18next";
import * as Yup from "yup";

export const getCreateKeySchema = (intl: TFunction) =>
  Yup.object().shape({
    alias: Yup.string()
      .min(3, intl("min-characters", { min: 3 }))
      .required(intl("required")),
    passphrase: Yup.string().min(5, intl("min-characters", { min: 5 })),
    name: Yup.string(),
    email: Yup.string(),
  });
