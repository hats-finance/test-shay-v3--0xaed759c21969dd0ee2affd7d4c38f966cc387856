import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, FormInput, Modal } from "components";
import { getPath } from "utils/objects.utils";
import { getUnlockKeystoreSchema } from "./formSchema";
import { StyledKeystoreContainer } from "../../styles";

type UnlockKeystoreProps = {
  onClose?: () => void;
  onUnlockKeystore?: (pass: string) => Promise<void> | undefined;
};

export const UnlockKeystore = ({ onClose, onUnlockKeystore }: UnlockKeystoreProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | undefined>();

  const {
    control,
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isValid },
  } = useForm<{ password: string }>({
    resolver: yupResolver(getUnlockKeystoreSchema(t)),
    mode: "onChange",
  });

  useEffect(() => setFocus("password"), [setFocus]);

  const password = useWatch({ control, name: "password" });
  useEffect(() => setError(undefined), [password]);

  const onSubmit = async (data: { password: string }) => {
    if (onUnlockKeystore) {
      try {
        await onUnlockKeystore(data.password);
      } catch (error) {
        setError((error as any).message);
      }
    }
  };

  return (
    <Modal title={t("PGPTool.title")} pgpKeystoreStyles capitalizeTitle isShowing={true} onHide={onClose}>
      <StyledKeystoreContainer>
        <div className="description mb-4">{t("PGPTool.unlockPgpTool")}</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            {...register("password")}
            placeholder={t("PGPTool.enterYourPgpToolPassword")}
            label={t("PGPTool.pgpToolPassword")}
            colorable
            error={getPath(errors, "password")}
          />

          <p className="error mb-2">{error}</p>
          <Button disabled={!isValid} type="submit" expanded>
            {t("PGPTool.unlockKeystore")}
          </Button>
        </form>
      </StyledKeystoreContainer>
    </Modal>
  );
};
