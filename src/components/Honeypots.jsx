import { useState } from "react";
import Loading from "./Shared/Loading";
import Modal from "./Shared/Modal";
import Vault from "./Vault";
import DepositWithdraw from "./DepositWithdraw";
import "../styles/Honeypots.scss";
import { useSelector } from "react-redux";
import { POOL_PREFIX } from "../constants/constants";

export default function Honeypots() {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const vaultsData = useSelector(state => state.dataReducer.vaults);

  const vaults = vaultsData.map((vault, index) => {
    if (!vault.name.startsWith(POOL_PREFIX)) {
      return <Vault key={index} data={vault} setShowModal={setShowModal} setModalData={setModalData} />
    }
    return null;
  });

  return (
    <div className="content honeypots-wrapper">
      {vaultsData.length === 0 ? <Loading fixed /> : <table>
        <tbody>
          <tr>
            <th></th>
            <th>Project</th>
            <th>Honeypot</th>
            <th>Vulnerabilities found</th>
            <th>Funds given</th>
            <th>APY</th>
            <th></th>
          </tr>
          {vaults}
        </tbody>
      </table>}
      {showModal &&
        <Modal title={modalData.name} setShowModal={setShowModal} >
          <DepositWithdraw data={modalData} />
        </Modal>}
    </div>
  )
}
