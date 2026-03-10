import VolumeSlab from './VolumeSlab'
import EarlyBird from './EarlyBird'

const DefineTarget = ({ schemeConfig, setTargetData, setExpanded }) => {
  return (
    <div>
      {/* {schemeConfigure === 'Flat Discount' ? (
        <FlatDiscount setTargetData={setTargetData} setExpanded={setExpanded} />
      ) : schemeConfigure === 'Volume Slab' ? (
        // <VolumeDiscount setTargetData={setTargetData} />
        <SimulatorFields setTargetData={setTargetData} schemeConfigure={schemeConfigure} setExpanded={setExpanded} />
      ) : schemeConfigure === 'Discount on Single Invoice' ? (
        <DiscountSingle setTargetData={setTargetData} setExpanded={setExpanded} />
      ) : // <SimulatorFields setTargetData={setTargetData} schemeConfigure={schemeConfigure} />

      schemeConfigure === 'Early Bird' ? (
        // <EarlyBird setTargetData={setTargetData} />
        // <SimulatorFields setTargetData={setTargetData} schemeConfigure={schemeConfigure} setExpanded={setExpanded} />
        <EarlyBird2 setTargetData={setTargetData} />
      ) : schemeConfigure === 'Old Code' ? (
        <OldCode setTargetData={setTargetData} setExpanded={setExpanded} />
      ) : schemeConfigure === 'Buy X Get Y' ? (
        <BuyXgetY setTargetData={setTargetData} setExpanded={setExpanded} />
      ) : schemeConfigure === 'Club Based Discount' ? (
        <ClubBased setTargetData={setTargetData} setExpanded={setExpanded} />
      ) : (
        // <></>
        // <SimulatorFields setTargetData={setTargetData} schemeConfigure={schemeConfigure} setExpanded={setExpanded} />
        <SimulatorConfigure setTargetData={setTargetData} />
      )} */}
      {schemeConfig === 'Volume Discount' && (
        <VolumeSlab setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      )}
      {schemeConfig === 'Ealy Bird' && (
        <EarlyBird setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      )}
    </div>
  )

  // return <FlatDiscount />
  // return <VolumeDiscount />
  // return <DiscountSingle />
  // return <OldCode />
  // return <BuyXgetY />
  // return <ApprovalScheme />
  // return <SimulatorFields setTargetData={setTargetData} schemeConfigure={schemeConfigure} />
}

export default DefineTarget
