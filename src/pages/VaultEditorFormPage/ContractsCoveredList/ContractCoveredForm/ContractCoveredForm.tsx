import { useTranslation } from "react-i18next";
import { MultiSelect, HatsFormInput } from "components";
import { MultiSelectOption } from "components/MultiSelect/MultiSelect";
import RemoveIcon from "assets/icons/remove-member.svg";
import { StyledContractCoveredForm } from "./styles";

export default function ContractCoveredForm({
  index,
  contract,
  onChange,
  onRemove,
  severitiesOptions,
  contractsCount,
  addContract,
}) {
  const { t } = useTranslation();
  const basePath = `contracts.${index}`;

  return (
    <StyledContractCoveredForm>
      <div className="contract">
        <div className="index-number">{index + 1}</div>

        <div className="content">
          <div className="subcontent">
            <div className="name">
              <label>{t("VaultEditor.contract-name")}</label>
              <HatsFormInput
                colorable
                name={`${basePath}.name`}
                value={contract.name}
                onChange={onChange}
                placeholder={t("VaultEditor.contract-name-placeholder")}
              />
            </div>
            <div className="severities">
              <label>{t("VaultEditor.contract-severities")}</label>
              <MultiSelect
                name={`${basePath}.severities`}
                value={contract.severities}
                onChange={onChange}
                options={severitiesOptions as Array<MultiSelectOption>}
              />
            </div>
          </div>

          <div>
            <label>{t("VaultEditor.contract-address")}</label>
            <HatsFormInput
              pastable
              colorable
              name={`${basePath}.address`}
              value={contract.address}
              onChange={onChange}
              placeholder={t("VaultEditor.contract-address-placeholder")}
            />
          </div>
        </div>
      </div>

      <div className="controller-buttons">
        {contractsCount > 1 && (
          <button className="fill" onClick={() => onRemove(index)}>
            <img src={RemoveIcon} height={12} alt="remove-member" />
            {` ${t("VaultEditor.remove-member")}`}
          </button>
        )}
        {index === contractsCount - 1 && (
          <button className="fill" onClick={addContract}>
            {t("VaultEditor.add-member")}
          </button>
        )}
      </div>
    </StyledContractCoveredForm>
  );
}
