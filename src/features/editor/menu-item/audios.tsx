import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO, ADD_ITEMS } from "@designcombo/state";
import { IAudio } from "@designcombo/types";
import { Loader2, Music, Music2, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { generateId } from "@designcombo/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { AudioItem } from "./audio-item";

export const Audios = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<IAudio[]>([]);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchMusic = async (query: string, pageNumber: number = 1) => {
    if (pageNumber === 1) {
      setIsLoading(true);
    } else {
      setIsMoreLoading(true);
    }

    try {
      const response = await fetch("/api/audio/music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 30,
          page: pageNumber,
          query: query ? { keys: [query] } : {}
        })
      });

      const data = await response.json();

      if (data.musics) {
        const mappedMusics = data.musics.map((music: any) => ({
          id: music.id,
          details: {
            src: music.src
          },
          name: music.name,
          type: music.type,
          metadata: {
            author: music.description || ""
          }
        }));

        if (pageNumber === 1) {
          setSearchResults(mappedMusics);
        } else {
          setSearchResults((prev: IAudio[]) => [...prev, ...mappedMusics]);
        }

        setHasMore(data.pagination?.hasMore || false);
      } else {
        if (pageNumber === 1) {
          setSearchResults([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch music:", error);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((query: string) => {
      setPage(1);
      fetchMusic(query, 1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchMusic("");
  }, []);
  const handleAddAudio = (payload: Partial<IAudio>) => {
    payload.id = generateId();
    console.log(payload);
    dispatch(ADD_AUDIO, {
      payload,
      options: {}
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedFetch(query);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMusic(searchQuery, nextPage);
  };

  const uniqueResults = Array.from(
    new Map(searchResults.map((item: IAudio) => [item.id, item])).values()
  );

  // Main view
  return (
    <div className="flex flex-1 flex-col max-w-full h-full">
      <div className="flex items-center gap-2 p-4">
        <div className="relative flex-1">
          <Button
            size="sm"
            variant="ghost"
            className="absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => fetchMusic(searchQuery)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </Button>
          <Input
            placeholder="Search stock audios..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchMusic(searchQuery);
              }
            }}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Button
            size="sm"
            variant="outline"
            // onClick={handleClearSearch}
            disabled={isLoading}
          >
            Clear
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1  max-w-full px-4">
        {isLoading && uniqueResults.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : uniqueResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Music2 size={32} className="opacity-50" />
            <span className="text-sm">No music found</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {uniqueResults.map((audio, index) => (
              <AudioItem
                onAdd={handleAddAudio}
                item={audio}
                key={index}
                playingId={playingId}
                setPlayingId={setPlayingId}
              />
            ))}
          </div>
        )}

        {hasMore && uniqueResults.length > 0 && (
          <div className="py-4 flex justify-center">
            <Button
              onClick={loadMore}
              disabled={isMoreLoading}
              className="bg-primary/60 hover:bg-primary/80"
            >
              {isMoreLoading && <Loader2 className="animate-spin" size={12} />}
              Load More
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
