export const theme = {
  onboarding: {
    // background: 'linear-gradient(#002C67, #005FFF)',
    background: {
      to: '#012C69',
      from: '#028DFD',
    },
    title: '#F2F2F2',
    text: '#F2F2F2',
    tab: {
      active: '#E7E7E7',
      inactive: '#91A5C0',
    },
  },
  home: {
    header: '#026aa2',
    createEntryBorder: '#667085',
    entryItem: {
      highlightBorder: '#D1E9FF',
      normalBorder: '#EAECF0',
      expandIconBorder: '#D0D5DD',
    },
  },
  entry: {
    background: '#0BA5EC',

    footer: {
      divider: '#B3B3B3',
      background: 'rgba(255,255,255,0.75)',
    },
    modal: {
      background: '#F2F4F7',
      divider: '#EAECF0',
      header: {
        swiper: '#B4B7BB',
        updateText: {
          active: '#D0D5DD',
          inactive: '#0BA5EC',
        },
      },
      events: {
        id: {
          background: '#E1E3E6',
        },
      },
      tagging: {
        background: '#F9FAFB',
      },
    },
    buttons: {
      toggle: {
        background: {
          active: '#F0F9FF',
          inactive: '#EAECF0',
        },
        border: {
          active: '#0BA5EC',
          inactive: '#EAECF0',
        },
        icon: {
          active: '#0AA2E8',
          inactive: '#646E83',
        },
        text: {
          active: '#026AA2',
          inactive: '#344054',
        },
      },
      requestRewrite: {
        background: {
          active: '#DAEDFA',
          inactive: '#EAECF0',
        },
        border: {
          active: '#0AA2E8',
          inactive: '#EAECF0',
        },
        icon: {
          active: '#02689F',
          inactive: '#667085',
        },
        text: {
          active: '#026AA2',
          inactive: '#344054',
        },
      },
      tagSubmit: {
        background: '#F2F4F7',
      },
    },
    textInput: {
      border: '#D0D5DD',
    },
    tags: {
      text: '#03659D',
      background: '#F0F9FF',
    },
  },
  general: {
    barMenu: '#0B4A6F',
    timeText: '#667085',
    strongText: '#475467',
    timeDivider: '#D0D5DD',
  },
};
