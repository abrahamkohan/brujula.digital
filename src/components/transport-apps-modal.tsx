"use client";

import { useState } from "react";
import { X, Smartphone } from "lucide-react";

const APPS = [
  {
    id: "uber",
    name: "Uber",
    desc: "La más popular — 24hs, autos privados",
    color: "#000000",
    logo: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg"
        alt="Uber"
        className="h-6"
      />
    ),
    ios: "https://apps.apple.com/app/uber/id368677368",
    android: "https://play.google.com/store/apps/details?id=com.ubercab",
  },
  {
    id: "bolt",
    name: "Bolt",
    desc: "Alternativa económica — muy disponible",
    color: "#34D186",
    logo: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bolt_logo.png/330px-Bolt_logo.png"
        alt="Bolt"
        className="h-5"
      />
    ),
    ios: "https://apps.apple.com/app/bolt-request-a-ride/id675033630",
    android: "https://play.google.com/store/apps/details?id=ee.mtakso.client",
  },
  {
    id: "muv",
    name: "MUV",
    desc: "100% paraguaya — muy popular localmente",
    color: "#FF6200",
    logo: (
      <svg viewBox="0 0 101 26" className="h-4" aria-label="MUV">
        <path d="M69.7809 0.268273C69.2349 0.106999 68.617 0.0253906 67.9408 0.0253906C66.8858 0.0253906 66.0231 0.276045 65.3857 0.769581C64.6921 1.30392 64.3423 2.14138 64.3423 3.25281V13.7725C64.3423 15.7408 63.8857 17.2389 62.9861 18.2279C62.1059 19.1956 60.6971 19.6852 58.8007 19.6852C56.9043 19.6852 55.4956 19.1956 54.6154 18.2279C53.7157 17.2409 53.2591 15.7428 53.2591 13.7725V0.77541L52.8083 0.598592C52.6237 0.524756 52.2895 0.417888 51.7882 0.268273C51.2442 0.106999 50.6418 0.0253906 49.9967 0.0253906C48.9086 0.0253906 48.0323 0.276045 47.393 0.769581C46.7013 1.30392 46.3496 2.14138 46.3496 3.25281V14.9636C46.3496 16.6735 46.6605 18.2338 47.2764 19.6056C47.8943 20.9812 48.7648 22.1607 49.8646 23.1108C50.9585 24.059 52.2895 24.7877 53.8187 25.2754C55.3285 25.7553 57.0034 26.0002 58.8007 26.0002C60.598 26.0002 62.273 25.7553 63.7808 25.2754C65.308 24.7896 66.6448 24.061 67.7563 23.1147C68.8755 22.1607 69.7479 20.9793 70.3502 19.5997C70.9487 18.2299 71.2518 16.6716 71.2518 14.9655V0.77541L70.801 0.598592C70.6164 0.524756 70.2822 0.417888 69.7829 0.268273" fill="#FF6200" />
        <path d="M39.3974 2.90888C38.286 1.96261 36.9492 1.23396 35.4219 0.748197C33.9141 0.268263 32.2372 0.0234375 30.4419 0.0234375C28.6465 0.0234375 26.9696 0.268263 25.4599 0.748197C23.9307 1.2359 22.5997 1.96261 21.5057 2.91276C21.4902 2.92636 21.4747 2.94191 21.4591 2.95551C21.4416 2.93996 21.4241 2.92442 21.4066 2.90888C20.2952 1.96261 18.9584 1.23396 17.4312 0.748197C15.9214 0.268263 14.2465 0.0253806 12.4492 0.0253806C10.6518 0.0253806 8.97692 0.270206 7.46716 0.75014C5.93798 1.23785 4.60699 1.96455 3.51305 2.9147C2.41328 3.86486 1.54279 5.04429 0.924895 6.41998C0.310889 7.78789 0 9.35011 0 11.06V22.7688C0 23.8803 0.351693 24.7177 1.04342 25.2521C1.68269 25.7456 2.55706 25.9963 3.64712 25.9963C4.29221 25.9963 4.89456 25.9147 5.43861 25.7534C5.93992 25.6038 6.27218 25.4969 6.45872 25.4231L6.90951 25.2462V12.2491C6.90951 10.2789 7.36613 8.78079 8.26576 7.79372C9.14596 6.82608 10.5547 6.33643 12.4511 6.33643C14.3475 6.33643 15.7543 6.82608 16.6345 7.79372C17.5341 8.78079 17.9908 10.2789 17.9908 12.2491V22.7688C17.9908 23.7423 18.2589 24.504 18.7913 25.0364C18.8671 25.1122 18.9487 25.1841 19.0342 25.2521C19.0555 25.2676 19.0769 25.2812 19.0983 25.2968C19.7298 25.7592 20.5672 25.9963 21.5893 25.9963C21.5971 25.9963 21.6048 25.9963 21.6126 25.9963C21.6204 25.9963 21.6282 25.9963 21.6379 25.9963C22.2733 25.9963 22.8659 25.9166 23.4041 25.7592C23.4119 25.7573 23.4216 25.7553 23.4313 25.7514C23.7675 25.6523 24.0259 25.5707 24.2163 25.5066C24.3096 25.4755 24.3892 25.4464 24.4495 25.4231L24.9003 25.2462V12.2491C24.9003 10.2789 25.3569 8.78079 26.2565 7.79372C27.1367 6.82608 28.5454 6.33643 30.4419 6.33643C32.3383 6.33643 33.7451 6.82608 34.6272 7.79372C35.5268 8.78079 35.9835 10.2789 35.9835 12.2491V22.7688C35.9835 23.8803 36.3332 24.7177 37.0269 25.2521C37.6642 25.7456 38.5269 25.9963 39.582 25.9963C40.2582 25.9963 40.878 25.9147 41.4221 25.7534C41.9234 25.6038 42.2556 25.4969 42.4402 25.4231L42.891 25.2462V11.06C42.891 9.35399 42.5879 7.79566 41.9894 6.42581C41.389 5.04624 40.5166 3.86292 39.3955 2.91082" fill="#FF6200" />
        <path d="M81.4507 0.784995L86.081 18.766C86.3492 19.7376 87.379 19.6734 87.379 19.6734C87.379 19.6734 88.4088 19.7298 88.6983 18.7621L92.6272 3.11278C92.8778 1.69629 93.5579 1.02399 94.2108 0.62955C94.9005 0.211793 95.6214 0.0291458 96.6765 0.0291458C97.3527 0.0291458 97.9725 0.110754 98.5166 0.272028C98.5166 0.272028 99.5542 0.575145 100.137 0.75002L95.2464 19.6715C93.6784 26.2507 87.377 25.9728 87.377 25.9728C80.1799 25.9961 79.1637 19.6715 79.1637 19.6715L74.8715 3.22742C74.7316 2.15096 75.2232 1.27853 75.9149 0.74419C76.5542 0.250654 77.4286 0 78.5186 0C79.1637 0 79.7661 0.0816083 80.3101 0.242882C80.3101 0.242882 80.7901 0.378896 81.4488 0.783052" fill="#FF6200" />
      </svg>
    ),
    ios: "https://apps.apple.com/us/app/muv/id1254658756",
    android: "https://play.google.com/store/apps/details?id=com.muv.customer",
  },
];

export function TransportAppsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 px-5 py-3.5 flex items-center gap-3 hover:bg-[#F5F4ED] transition-colors text-left w-full cursor-pointer"
      >
        <Smartphone className="h-4 w-4 text-[#C96442] shrink-0" />
        <span className="text-xs font-semibold text-[#1F1E1D]">Uber · Bolt · MUV</span>
        <span className="text-[11px] text-[#C96442] ml-auto shrink-0">Descargar →</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h3 className="font-bold text-[#1F1E1D] text-base">Apps de transporte</h3>
                <p className="text-xs text-[#87867F] mt-0.5">Descargalas antes de llegar</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F4ED] flex items-center justify-center hover:bg-[#D4D2C9] transition-colors"
              >
                <X className="h-4 w-4 text-[#5C5B57]" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-3">
              {APPS.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-[#D4D2C9] bg-[#F5F4ED]/50"
                >
                  <div className="w-14 flex items-center">{app.logo}</div>
                  <p className="flex-1 text-[11px] text-[#87867F] leading-snug">{app.desc}</p>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a
                      href={app.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#1F1E1D] text-white text-[10px] font-bold text-center hover:bg-[#C96442] transition-colors"
                    >
                      iOS
                    </a>
                    <a
                      href={app.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#1F1E1D] text-white text-[10px] font-bold text-center hover:bg-[#C96442] transition-colors"
                    >
                      Android
                    </a>
                  </div>
                </div>
              ))}

              <p className="text-[11px] text-[#87867F] text-center pt-1">
                Uber también opera con taxis amarillos oficiales
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
