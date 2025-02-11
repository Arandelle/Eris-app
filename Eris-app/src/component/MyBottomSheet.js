import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'

const MyBottomSheet = forwardRef(({children, index}, ref) => {

    const [initialIndex, setInitialIndex] = useState(0);
    const bottomSheetRef = useRef(null);

    const snapPoints = useMemo(() => ["30%", "50%"], []);
    
    // used to manually open the modal
    // const openBottomSheet = () => {
    //     bottomSheetRef.current?.snapToIndex(initialIndex);
    // };

    useImperativeHandle(ref, () => ({
      openBottomSheet: () => bottomSheetRef.current?.expand(),
      closeBottomSheet: () => bottomSheetRef.current?.close()
    }))


  return (
    <BottomSheet
    ref={bottomSheetRef}
    index={index ? initialIndex : -1} // start hidden, when index is true it sets to 0 or visible
    snapPoints={snapPoints}
    enablePanDownToClose={true}
    >
      <BottomSheetView>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default MyBottomSheet;
