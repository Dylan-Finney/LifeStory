import 'react-native-url-polyfill/auto';

import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import AIRewriteIcon from '../assets/ai-rewrite-icon.svg';

import MenuIcon from '../assets/menu-icon.svg';

import RefreshIcon from '../assets/refresh-icon.svg';
import AlignLeft from '../assets/align-left-icon.svg';

import UndoIcon from '../assets/flip-backward.svg';

import _ from 'lodash';

import {theme} from '../../Styling';

import {horizontalScale, moderateScale, verticalScale} from '../utils/Metrics';

function getDifferenceUnit(diff) {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff >= week) {
    // return diff / week > 1
    //   ? `${Math.floor(diff / week)}wks`
    //   : `${Math.floor(diff / week)}wk`;
    return `${Math.floor(diff / week)}wk`;
  } else if (diff >= day) {
    return `${Math.floor(diff / day)}d`;
  } else if (diff >= hour) {
    return `${Math.floor(diff / hour)}h`;
  } else {
    return `${Math.floor(diff / minute)}m`;
  }
}

export const AIRewriteTitle = ({
  entry,
  tempTitle,
  tempOrigins,
  currentDate,
  setTempTitle,
  loading,
  rewriteRequest,
}) => {
  return (
    <AIRewriteAttr
      changes={entry.title !== tempTitle}
      lengthen={async () => {
        rewriteRequest({attr: 'title', action: 'lengthen'});
      }}
      loading={loading}
      refresh={async () => {
        rewriteRequest({attr: 'title', action: 'new'});
      }}
      shorten={async () => {
        rewriteRequest({attr: 'title', action: 'shorten'});
      }}
      undo={() => {
        setTempTitle(entry.title);
      }}
      attribute={'title'}
      changedSince={
        tempTitle !== entry.title
          ? tempOrigins.title - currentDate
          : entry.origins.title.time - currentDate
      }
      isAutogenerated={
        entry.origins.title.source === 'auto' || entry.title !== tempTitle
      }
      title={'Entry Title'}
      tempValue={tempTitle}
    />
  );
};

export const AIRewriteContents = ({
  entry,
  tempOrigins,
  currentDate,
  setTempEntry,
  loading,
  tempEntry,
  rewriteRequest,
}) => {
  return (
    <AIRewriteAttr
      attribute={'entry'}
      changedSince={
        tempEntry !== entry.entry
          ? tempOrigins.entry - currentDate
          : entry.origins.entry.time - currentDate
      }
      changes={entry.entry !== tempEntry}
      isAutogenerated={
        entry.origins.entry.source === 'auto' || entry.entry !== tempEntry
      }
      lengthen={async () => {
        rewriteRequest({attr: 'entry', action: 'lengthen'});
      }}
      loading={loading}
      refresh={async () => {
        rewriteRequest({attr: 'entry', action: 'new'});
      }}
      shorten={async () => {
        rewriteRequest({attr: 'entry', action: 'shorten'});
      }}
      title={'Entry Content'}
      undo={() => {
        setTempEntry(entry.entry);
      }}
      tempValue={tempEntry}
    />
  );
};

export const AIRewriteAttr = ({
  isAutogenerated,
  title,
  changedSince,
  changes,
  loading,
  undo,
  refresh,
  shorten,
  lengthen,
  attribute,
  tempValue,
}) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(10),
        gap: verticalScale(5),
      }}>
      <Text
        style={{
          color: theme.general.strongText,
          fontSize: 16,
          fontWeight: 600,
        }}>
        {title}
      </Text>
      <View
        style={{
          height: verticalScale(0.5),
          backgroundColor: theme.entry.modal.divider,
        }}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {isAutogenerated ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: theme.entry.tags.background,
              borderRadius: 10,
              paddingHorizontal: horizontalScale(10),
              paddingVertical: verticalScale(3),
            }}>
            <AIRewriteIcon
              width={17}
              height={16}
              stroke={theme.entry.buttons.toggle.icon.active}
            />
            <Text
              style={{
                color: theme.entry.tags.text,
                fontWeight: 500,
              }}>
              Auto-generated{' '}
              {changedSince === null
                ? ''
                : getDifferenceUnit(Math.abs(changedSince))}
            </Text>
          </View>
        ) : (
          <View>
            <Text>Manual</Text>
          </View>
        )}
        <AIRewriteOptions
          changes={changes}
          lengthen={lengthen}
          loading={loading}
          refresh={refresh}
          shorten={shorten}
          undo={undo}
          attribute={attribute}
        />
      </View>
      {attribute === 'entry' ? (
        <ScrollView style={{height: verticalScale(200)}}>
          <Text>{tempValue}</Text>
        </ScrollView>
      ) : (
        <Text style={{fontSize: moderateScale(18), fontWeight: 600}}>
          {tempValue}
        </Text>
      )}
    </View>
  );
};

export const AIRewriteOptions = ({
  loading,
  changes,
  undo,
  refresh,
  shorten,
  lengthen,
  attribute,
}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: horizontalScale(5),
      }}>
      {changes && (
        <TouchableOpacity
          onPress={() => {
            undo();
          }}
          style={{
            backgroundColor:
              theme.entry.buttons.requestRewrite.background.inactive,
            // padding: 2.5,
            paddingHorizontal: horizontalScale(2.5),
            paddingVertical: verticalScale(2.5),
            borderRadius: 3,
          }}>
          <UndoIcon />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={async () => {
          refresh();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <RefreshIcon
          stroke={
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          shorten();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <MenuIcon
          stroke={
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          lengthen();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <AlignLeft
          stroke={
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
    </View>
  );
};