import { Squad } from './classes';

export type Squads = {[key: string]: Squad};
export type TagIdMap = Map<string|number, number|string>;
export type SideInfo = {slots: number, squads: string[], happiness: number};
export type Rotation = [Side, Side, Side, Side];
export type Roster = [[SideInfo, SideInfo], [SideInfo, SideInfo]];

export interface Side {slots: number; squads: bigint};
export type SideMakerMemo = {[key: string]: Side[]};

export type PossibleRotations = number[][];

export type SidesMakerRequest = {squads: Squads, tagIdMap: TagIdMap};
export type SidesMakerResponse = {command: 'update', side: Side} | {command: 'done'};
export type RosterMakerRequest = 
    {command: 'init', allSquads: bigint, slaveUrl: string} |
    {command: 'update', side: Side} |
    {command: 'done'};
export type RosterMakerResponse = {status: 'update', rotation: Rotation} | {status: 'done'};
export type RosterSlaveRequest = {
    command: 'init', 
    sides: Side[], 
    allSquads: bigint,
    limit: number,
    slaveIndex: number
} | {command: 'start'};
export type RosterSlaveResponse = {slaveIndex: number, status: 'done'};


export type HappinessInfo = {tag: string, happy: string[], unhappy: string[], total: number};