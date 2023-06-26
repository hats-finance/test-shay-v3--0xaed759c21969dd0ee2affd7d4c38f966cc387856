import { IVaultRepoInformation } from "@hats-finance/shared";
import { AxiosResponse } from "axios";
import { axiosClient } from "config/axiosClient";
import { BASE_SERVICE_URL } from "settings";

export type IContractsCoveredData = {
  name: string;
  path: string;
  lines: number;
};

/**
 * Gets contracts information from a list of repos
 * @param repos - the list of IVaultRepoInformation
 */
export async function getContractsInfoFromRepos(repos: IVaultRepoInformation[]): Promise<IContractsCoveredData[]> {
  const promises: Promise<AxiosResponse<any, any>>[] = [];

  for (const repo of repos) {
    promises.push(
      axiosClient.get(`${BASE_SERVICE_URL}/utils/get-solidity-info-for-repo?repoUrl=${repo.url}/commit/${repo.commitHash}`)
    );
    promises.push(
      axiosClient.get(
        `${BASE_SERVICE_URL}/utils/get-solidity-info-for-repo?repoUrl=${repo.url}/commit/b0501571cc53394a236c4f783g7fd5a27961c670`
      )
    );
  }

  const data = await Promise.all(promises.map((p) => p.catch((e) => e)));
  const validData = data.filter((d) => !(d instanceof Error));
  const dataFlat = validData.flatMap((d) => d.data.files);

  return dataFlat as IContractsCoveredData[];
}
