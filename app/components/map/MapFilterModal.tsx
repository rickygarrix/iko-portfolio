"use client";

import { Dispatch, SetStateAction } from "react";
import SlideDownModal from "@/components/SlideDownModal";
import SearchFilter from "@/components/SearchFilter";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedGenres: string[];
  setSelectedGenres: Dispatch<SetStateAction<string[]>>;
  selectedAreas: string[];
  setSelectedAreas: Dispatch<SetStateAction<string[]>>;
  selectedPayments: string[];
  setSelectedPayments: Dispatch<SetStateAction<string[]>>;
  showOnlyOpen: boolean;
  setShowOnlyOpen: Dispatch<SetStateAction<boolean>>;
  previewCount: number;
  handleSearch: () => void;
  messages: {
    title: string;
    search: string;
    reset: string;
    items: string;
    open: string;
    open_all: string;
    open_now: string;
    genre: string;
    area: string;
    payment: string;
    genres: { [key: string]: string };
    areas: { [key: string]: string };
    payments: { [key: string]: string };
  };
};

export default function MapFilterModal({
  isOpen,
  onClose,
  selectedGenres,
  setSelectedGenres,
  selectedAreas,
  setSelectedAreas,
  selectedPayments,
  setSelectedPayments,
  showOnlyOpen,
  setShowOnlyOpen,
  previewCount,
  handleSearch,
  messages,
}: Props) {
  return (
    <SlideDownModal isOpen={isOpen} onClose={onClose}>
      <SearchFilter
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas}
        setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments}
        setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen}
        setShowOnlyOpen={setShowOnlyOpen}
        previewCount={previewCount}
        handleSearch={handleSearch}
        messages={messages}
      />
    </SlideDownModal>
  );
}