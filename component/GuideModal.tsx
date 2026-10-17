"use client";

import React from "react";
import GuidePopup from "@/component/GuidePopup";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Popup "Panduan Penggunaan" di landing page.
 * Tampilan & isinya sama persis dengan popup Panduan di halaman role User
 * karena keduanya memakai komponen GuidePopup yang sama.
 */
export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;
  return <GuidePopup onClose={onClose} />;
}