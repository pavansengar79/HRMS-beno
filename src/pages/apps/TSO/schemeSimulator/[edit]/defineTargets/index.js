import ApprovalScheme from './Approval'
import SimulatorFields from './SimulatorFields'

const DefineTarget = ({ simulatorData, allData, setApprovalData, detailsData, eligibilityData }) => {
  return (
    <>
      {/* <SimulatorFields allData={allData} /> */}
      <ApprovalScheme
        simulatorData={simulatorData}
        setApprovalData={setApprovalData}
        detailsData={detailsData}
        eligibilityData={eligibilityData}
      />
    </>
  )
}

export default DefineTarget
