import FlatDiscount from './FlatDiscount'
import SimulatorFields from './simulatorFields'
import DiscountSingle from './DiscountSingle'
import OldCode from './OldCode'
import BuyXgetY from './BuyXgetY'
import ClubBased from './ClubBased'
import EarlyBird from './EarlyBird'
import SimulatorConfigure from './simulatorConfigure'
import EarlyBird2 from './EarlyBird2'
// import ApprovalScheme from '../../[edit]/defineTargets/Approval'
import SmartTyre from './SmartTyre'
import ProductDiscount from './ProductDiscount'
import VolumeDiscount from './VolumeDiscount'
import TargetBasedDiscount from './TargetBasedDiscount'

const DefineTarget = ({
  schemeConfig,
  setTargetData,
  setExpanded,
  eligibilityData,
  groupList,
  oldCodeMapping,
  productRunOn
}) => {
  console.log('schemeConfig', schemeConfig)
  return (
    <div>
      {schemeConfig === 'Flat Discount' ? (
        <FlatDiscount
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : schemeConfig === 'Product Discount' ? (
        <ProductDiscount
          setTargetData={setTargetData}
          eligibilityData={eligibilityData}
          groupList={groupList}
          setExpanded={setExpanded}
          productRunOn={productRunOn}
        />
      ) : // <SimulatorFields setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      schemeConfig === 'Discount on Single Invoice' ? (
        <DiscountSingle
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : // <SimulatorFields setTargetData={setTargetData} schemeConfig={schemeConfig} />

      schemeConfig === 'Early Bird' ? (
        <EarlyBird setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      ) : // <SimulatorFields setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      // <EarlyBird2 setTargetData={setTargetData} />
      schemeConfig === 'Old Code' ? (
        <OldCode
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          oldCodeMapping={oldCodeMapping}
        />
      ) : schemeConfig === 'Buy X Get Y' ? (
        <BuyXgetY
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : schemeConfig === 'Club Based Discount' ? (
        <ClubBased
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : schemeConfig === 'Smart Tyre' ? (
        <SmartTyre
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : schemeConfig === 'Volume Discount' ? (
        <VolumeDiscount setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
      ) : schemeConfig === 'Target Based Discount' ? (
        <TargetBasedDiscount
          setTargetData={setTargetData}
          setExpanded={setExpanded}
          eligibilityData={eligibilityData}
          groupList={groupList}
          productRunOn={productRunOn}
        />
      ) : (
        <></>
        // <SimulatorFields setTargetData={setTargetData} schemeConfig={schemeConfig} setExpanded={setExpanded} />
        // <SimulatorConfigure setTargetData={setTargetData} eligibilityData={eligibilityData} />
      )}
    </div>
  )

  // return <FlatDiscount />
  // return <VolumeDiscount />
  // return <DiscountSingle />
  // return <OldCode />
  // return <BuyXgetY />
  // return <ApprovalScheme />
  // return <SimulatorFields setTargetData={setTargetData} schemeConfig={schemeConfig} />
}

export default DefineTarget
