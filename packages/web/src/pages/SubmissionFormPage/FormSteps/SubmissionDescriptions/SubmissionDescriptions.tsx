import { IVulnerabilitySeverityV1, IVulnerabilitySeverityV2 } from "@hats-finance/shared";
import { yupResolver } from "@hookform/resolvers/yup";
import AddIcon from "@mui/icons-material/AddOutlined";
import RemoveIcon from "@mui/icons-material/DeleteOutlined";
import {
  Alert,
  Button,
  FormInput,
  FormMDEditor,
  FormSelectInput,
  FormSelectInputOption,
  FormSupportFilesInput,
} from "components";
import download from "downloadjs";
import { getCustomIsDirty, useEnhancedForm } from "hooks/form";
import { useVaults } from "hooks/vaults/useVaults";
import { useContext, useEffect, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BASE_SERVICE_URL } from "settings";
import { encryptWithKeys } from "../../encrypt";
import { SUBMISSION_INIT_DATA, SubmissionFormContext } from "../../store";
import { ISubmissionsDescriptionsData } from "../../types";
import { getCreateDescriptionSchema } from "./formSchema";
import { StyledSubmissionDescription, StyledSubmissionDescriptionsList } from "./styles";

export function SubmissionDescriptions() {
  const { t } = useTranslation();

  const { submissionData, setSubmissionData } = useContext(SubmissionFormContext);
  const [severitiesOptions, setSeveritiesOptions] = useState<FormSelectInputOption[] | undefined>();

  const { vaults } = useVaults();
  const vault = vaults?.find((vault) => vault.id === submissionData?.project?.projectId);
  const isPublicSubmission = vault?.description?.["project-metadata"].type === "audit";
  // const isPublicSubmission = true;

  const { register, handleSubmit, control, reset } = useEnhancedForm<ISubmissionsDescriptionsData>({
    resolver: yupResolver(getCreateDescriptionSchema(t)),
    mode: "onChange",
  });
  const {
    fields: submissionsDescriptions,
    append: appendSubmissionDescription,
    remove: removeSubmissionDescription,
  } = useFieldArray({ control, name: `descriptions` });

  // Reset form with saved data
  useEffect(() => {
    if (submissionData?.submissionsDescriptions) reset(submissionData.submissionsDescriptions);
  }, [submissionData, reset]);

  // Get severities information
  useEffect(() => {
    if (!vault || !vault.description) return;

    if (vault.description) {
      const severities = vault.description.severities.map((severity: IVulnerabilitySeverityV1 | IVulnerabilitySeverityV2) => ({
        label: severity.name.toLowerCase().replace("severity", "").trim(),
        value: severity.name.toLowerCase(),
      }));

      setSeveritiesOptions(severities);
    }
  }, [vault, t]);

  const handleSaveAndDownloadDescription = async (formData: ISubmissionsDescriptionsData) => {
    if (!vault) return;
    if (!submissionData) return alert("Please fill previous steps first.");

    let keyOrKeys: string | string[];

    // Get public keys from vault description
    if (vault.version === "v1") {
      keyOrKeys = vault.description?.["communication-channel"]?.["pgp-pk"] ?? [];
    } else {
      keyOrKeys =
        vault.description?.committee.members.reduce(
          (prev: string[], curr) => [...prev, ...curr["pgp-keys"].map((key) => key.publicKey)],
          []
        ) ?? [];
    }

    keyOrKeys = typeof keyOrKeys === "string" ? keyOrKeys : keyOrKeys.filter((key) => !!key);
    if (keyOrKeys.length === 0) return alert("This project has no keys to encrypt the description. Please contact HATS team.");

    let toEncrypt: string = "";
    let decrypted: string | undefined = undefined;
    let submissionMessage = "";

    // Submission on audit vaults are public and they have files
    if (isPublicSubmission) {
      toEncrypt = `**Communication channel:** ${submissionData.contact?.communicationChannel} (${submissionData.contact?.communicationChannelType})`;
      decrypted = `**Project Name:** ${submissionData.project?.projectName}
**Project Id:** ${submissionData.project?.projectId}
**Beneficiary:** ${submissionData.contact?.beneficiary}
**Github username:** ${submissionData.contact?.githubUsername ?? "---"}
    
${formData.descriptions
  .map(
    (description, idx) => `
**SUBMISSION #${idx + 1}**
**Title:** ${description.title}
**Severity:** ${description.severity}
**Description:**
${description.description}
**Files:** 
${description.files.map((file) => `  - ${file.name} (${BASE_SERVICE_URL}/files/${file.ipfsHash})`).join("\n")}
`
  )
  .join("\n")}`;
      submissionMessage = toEncrypt + decrypted;
    } else {
      toEncrypt = `**Project Name:** ${submissionData.project?.projectName}
**Project Id:** ${submissionData.project?.projectId}
**Beneficiary:** ${submissionData.contact?.beneficiary}
**Communication channel:** ${submissionData.contact?.communicationChannel} (${submissionData.contact?.communicationChannelType})
    
${formData.descriptions
  .map(
    (description, idx) => `
**SUBMISSION #${idx + 1}**
**Title:** ${description.title}
**Severity:** ${description.severity}
**Description:**
${description.description}
`
  )
  .join("\n")}`;
      submissionMessage = toEncrypt;
    }

    const { encryptedData, sessionKey } = await encryptWithKeys(keyOrKeys, toEncrypt);
    const submissionInfo = {
      decrypted,
      encrypted: encryptedData as string,
    };

    download(
      JSON.stringify({ submission: submissionInfo, sessionKey }),
      `${submissionData.project?.projectName}-${new Date().getTime()}.json`
    );

    setSubmissionData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        submissionsDescriptions: {
          verified: true,
          submission: JSON.stringify(submissionInfo),
          submissionMessage: submissionMessage,
          descriptions: formData.descriptions,
        },
        submissionResult: undefined,
      };
    });
  };

  if (!vault) return <Alert type="error">{t("Submissions.firstYouNeedToSelectAProject")}</Alert>;

  return (
    <StyledSubmissionDescriptionsList>
      {submissionsDescriptions.map((submissionDescription, index) => (
        <StyledSubmissionDescription key={submissionDescription.id}>
          <p className="bold mb-2">
            {t("submission")} #{index + 1}
          </p>
          <p className="mb-4">{t("Submissions.provideExplanation")}</p>

          <div className="row">
            <FormInput
              {...register(`descriptions.${index}.title`)}
              label={`${t("Submissions.submissionTitle")}`}
              placeholder={t("Submissions.submissionTitlePlaceholder")}
              colorable
            />
            <Controller
              control={control}
              name={`descriptions.${index}.severity`}
              render={({ field, fieldState: { error }, formState: { dirtyFields, defaultValues } }) => (
                <FormSelectInput
                  isDirty={getCustomIsDirty<ISubmissionsDescriptionsData>(field.name, dirtyFields, defaultValues)}
                  error={error}
                  label={t("severity")}
                  placeholder={t("severityPlaceholder")}
                  colorable
                  options={severitiesOptions ?? []}
                  {...field}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name={`descriptions.${index}.description`}
            render={({ field, fieldState: { error }, formState: { dirtyFields, defaultValues } }) => (
              <FormMDEditor
                isDirty={getCustomIsDirty<ISubmissionsDescriptionsData>(field.name, dirtyFields, defaultValues)}
                error={error}
                colorable
                {...field}
              />
            )}
          />

          {isPublicSubmission && (
            <Controller
              control={control}
              name={`descriptions.${index}.files`}
              render={({ field, fieldState: { error } }) => (
                <FormSupportFilesInput label={t("Submissions.selectSupportFiles")} error={error} {...field} />
              )}
            />
          )}

          {submissionsDescriptions.length > 1 && (
            <div className="buttons mt-3">
              <Button onClick={() => removeSubmissionDescription(index)} styleType="invisible">
                <RemoveIcon className="mr-3" />
                {t("Submissions.removeVulnerability")}
              </Button>
            </div>
          )}
        </StyledSubmissionDescription>
      ))}

      <div className="buttons mt-3">
        <Button
          onClick={() => appendSubmissionDescription(SUBMISSION_INIT_DATA.submissionsDescriptions.descriptions[0])}
          styleType="invisible"
        >
          <AddIcon className="mr-3" />
          {t("Submissions.addAnotherVulnerability")}
        </Button>
        <Button onClick={handleSubmit(handleSaveAndDownloadDescription)}>{t("Submissions.saveAndDownload")}</Button>
      </div>
    </StyledSubmissionDescriptionsList>
  );
}
