"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import { SceneRef } from "./scene/scene.types";
import StateManager, { DESIGN_LOAD } from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { ControlItem } from "./control-item";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import { useSceneStore } from "@/store/use-scene-store";
import { dispatch } from "@designcombo/events";
import MenuListHorizontal from "./menu-list-horizontal";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { ITrackItem } from "@designcombo/types";
import useLayoutStore from "./store/use-layout-store";
import ControlItemHorizontal from "./control-item-horizontal";
import { design } from "./mock";
import { Separator } from "@/components/ui/separator";

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const SceneContainer = ({
  sceneRef,
  playerRef,
  stateManager,
  trackItem,
  loaded,
  isLargeScreen,
}: any) => {
  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <div className="flex-1 relative overflow-hidden w-full h-full">
        <div className="flex h-full flex-1">
          <div className="flex-1 relative overflow-hidden w-full h-full">
            <CropModal />
            <Scene ref={sceneRef} stateManager={stateManager} />
          </div>
        </div>
      </div>

      <div className="w-full">
        {playerRef && <Timeline stateManager={stateManager} />}
      </div>

      {!isLargeScreen && !trackItem && loaded && <MenuListHorizontal />}
      {!isLargeScreen && trackItem && <ControlItemHorizontal />}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="bg-background/60 backdrop-blur-2xl w-full flex flex-none border-r border-border shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)] h-[calc(100vh-64px)] z-40">
      <div className="flex flex-col w-full">
        <MenuList />
        <Separator orientation="horizontal" className="bg-border/60" />
        <ControlItem />
      </div>
    </div>
  );
};

const Editor = ({ tempId, id }: { tempId?: string; id?: string }) => {
  const [projectName, setProjectName] = useState<string>("Untitled video");
  const { scene } = useSceneStore();
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const sceneRef = useRef<SceneRef>(null);
  const { timeline, playerRef } = useStore();
  const { activeIds, trackItemsMap, transitionsMap } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
  const {
    setTrackItem: setLayoutTrackItem,
    setFloatingControl,
    setLabelControlItem,
    setTypeControlItem,
  } = useLayoutStore();
  const isLargeScreen = useIsLargeScreen();

  useTimelineEvents();

  const { setCompactFonts, setFonts } = useDataState();
  // useEffect(() => {
  //   dispatch(DESIGN_LOAD, { payload: design });
  // }, []);
  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );

    // Trigger zoom recalculation when timeline is resized
    setTimeout(() => {
      sceneRef.current?.recalculateZoom();
    }, 100);
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItem = trackItemsMap[id];
      if (trackItem) {
        setTrackItem(trackItem);
        setLayoutTrackItem(trackItem);
      } else console.log(transitionsMap[id]);
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap]);

  useEffect(() => {
    setFloatingControl("");
    setLabelControlItem("");
    setTypeControlItem("");
  }, [isLargeScreen]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-background selection:bg-violet-500/30 overflow-hidden relative font-sans">
      {/* Premium ambient glows behind the entire UI */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none z-0" />
      
      <div className="z-50 relative">
        <Navbar
          projectName={projectName}
          user={null}
          stateManager={stateManager}
          setProjectName={setProjectName}
        />
      </div>

      <div className="flex flex-1 z-10 relative">
        {isLargeScreen ? (
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel
              defaultSize={30}
              minSize={20}
              maxSize={40}
              className="max-w-7xl relative bg-transparent min-w-0 overflow-visible!"
            >
              <Sidebar />
              <FloatingControl />
            </ResizablePanel>

            <ResizableHandle className="bg-border/40 hover:bg-violet-500/50 transition-colors w-[2px]" />

            <ResizablePanel
              defaultSize={70}
              minSize={60}
              className="min-w-0 min-h-0 bg-background/40 backdrop-blur-xl"
            >
              <SceneContainer
                sceneRef={sceneRef}
                playerRef={playerRef}
                stateManager={stateManager}
                trackItem={trackItem}
                loaded={loaded}
                isLargeScreen={isLargeScreen}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="bg-background/40 backdrop-blur-xl w-full h-full">
            <SceneContainer
              sceneRef={sceneRef}
              playerRef={playerRef}
              stateManager={stateManager}
              trackItem={trackItem}
              loaded={loaded}
              isLargeScreen={isLargeScreen}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
