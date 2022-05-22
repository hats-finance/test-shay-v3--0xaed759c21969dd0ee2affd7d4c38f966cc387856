import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import SearchIcon from "../../assets/icons/search.icon";
import { IVault } from "../../types/types";
import { formatWei, ipfsTransformUri } from "../../utils";
import Loading from "../Shared/Loading";
import { ScreenSize } from "../../constants/constants";
import "../../styles/Vulnerability/ProjectSelect.scss";
import { useVaults } from "hooks/useVaults";

export default function VaultSelector({ onSelect, selected }: {
    onSelect: (pid: string) => void
    selected?: string
}) {
    const [userInput, setUserInput] = useState("");
    const { vaults: vaultsData } = useVaults()
    const screenSize = useSelector((state: RootState) => state.layoutReducer.screenSize);

    const vaults = vaultsData?.map((vault: IVault, index: number) => {
        const projectName = vault.name;
        // TODO: We'll eliminate guest vault completely once it will be removed from the subgraph
        if (projectName?.toLowerCase().includes(userInput.toLowerCase()) && !vault.parentVault.liquidityPool && vault.parentVault.registered && !vault.isGuest) {
            return (<tr
                key={index}
                className={selected === vault.parentVault.pid ? " project-row selected" : "project-row"}
                onClick={() => onSelect(vault.parentVault.pid)} >
                {/* TODO: handle project-metadata and Project-metadata */}
                <td className="project-name-wrapper" >
                    <img className="project-logo" src={ipfsTransformUri(vault.description?.["project-metadata"]?.icon ?? vault.description?.["Project-metadata"]?.icon)} alt="project logo" />{projectName}</td >
                <td>{formatWei(vault.parentVault.honeyPotBalance, 3, vault.parentVault.stakingTokenDecimals)}</td>
            </tr >
            )
        }
        return undefined;
    })

    return <div className="project-select-wrapper">
        {!vaults ? <Loading /> :
            <>
                <div className="search-wrapper">
                    <SearchIcon />
                    <input type="text" placeholder="Search or select project" onChange={(e) => setUserInput(e.target.value)} />
                </div>

                {vaults.every((value: any) => value === undefined) ?
                    <div className="no-results">No projects found</div> :
                    <div className="table-wrapper">
                        <table>
                            <tbody>
                                {screenSize === ScreenSize.Desktop && (
                                    <tr>
                                        <th>PROJECT NAME</th>
                                        <th>VAULT TOTAL</th>
                                    </tr>
                                )}
                                {vaults}
                            </tbody>
                        </table>
                    </div>}
            </>}
    </div>
}
