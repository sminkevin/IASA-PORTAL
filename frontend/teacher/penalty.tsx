import * as React from 'react'

import { Button } from '@rmwc/button'
import { Typography } from '@rmwc/typography'
import { LinearProgress } from '@rmwc/linear-progress'
import {
    DataTable,
    DataTableContent,
    DataTableHead,
    DataTableRow,
    DataTableHeadCell,
    DataTableBody,
    DataTableCell,
} from '@rmwc/data-table'
import { createSnackbarQueue, SnackbarQueue } from '@rmwc/snackbar'

import {
    PenaltyListResponse,
    PenaltyResponse,
    PenaltyResponseOne,
    PID,
} from '../../scheme/api/penalty'
import { Permission, token } from '../../scheme/api/auth'
import { BrIfMobile, fetchAPI, focusNextInput, SearchUser } from '../util'
import { Grid, GridCell, GridRow } from '@rmwc/grid'
import { TextField } from '@rmwc/textfield'
import { Select } from '@rmwc/select'
import { UID, UserInfo } from '../../scheme/user'
import { formatTimeD } from '../../scheme/time'
import { IconButton } from '@rmwc/icon-button'

interface PenaltyProps {
    data: token
}

interface PenaltyState {
    data?: PenaltyResponse
    listData?: PenaltyListResponse
    loaded: boolean
    loadedList: boolean
    uid?: UID
    type?: string
    score?: string
    reason?: string
}

class Penalty extends React.Component<PenaltyProps, PenaltyState> {
    messages: any
    notify: any

    constructor(props: PenaltyProps) {
        super(props)
        let qu = createSnackbarQueue()
        this.messages = qu.messages
        this.notify = qu.notify

        this.state = {
            type: 'm',
            loaded: false,
            loadedList: false,
        }
        this.handleChange = this.handleChange.bind(this)
    }

    public componentDidMount() {
        this.refreshList()
    }

    public handleChange(e: React.FormEvent<HTMLInputElement>, target: string) {
        // @ts-ignore
        this.setState({ [target]: e.target.value })
    }

    public refresh() {
        if (!this.state?.uid) return
        this.setState({ loaded: false })
        fetchAPI('GET', {}, 'penalty', this.state?.uid.toString())
            .then((res: PenaltyResponse) => {
                if (res.success) {
                    this.setState({ loaded: true, data: res })
                } else {
                    this.notify({
                        title: <b>오류</b>,
                        body: res.message,
                        icon: 'error_outline',
                        dismissIcon: true,
                    })
                }
            })
            .catch(() => {
                this.notify({
                    title: <b>오류</b>,
                    body: '서버와 연결할 수 없어요.',
                    icon: 'error_outline',
                    dismissIcon: true,
                })
            })
    }

    public refreshList() {
        this.setState({ loadedList: false })
        fetchAPI('GET', {}, 'penalty', 'list')
            .then((res: PenaltyListResponse) => {
                if (res.success) {
                    this.setState({ loadedList: true, listData: res })
                } else {
                    this.notify({
                        title: <b>오류</b>,
                        body: res.message,
                        icon: 'error_outline',
                        dismissIcon: true,
                    })
                }
            })
            .catch(() => {
                this.notify({
                    title: <b>오류</b>,
                    body: '서버와 연결할 수 없어요.',
                    icon: 'error_outline',
                    dismissIcon: true,
                })
            })
    }

    public give() {
        if (!this.state?.type || !this.state?.score || !this.state?.reason) {
            this.notify({
                title: <b>오류</b>,
                body: '내용을 모두 입력하세요.',
                icon: 'error_outline',
                dismissIcon: true,
            })
            return
        }
        fetchAPI(
            'POST',
            {
                uid: this.state.uid,
                score:
                    parseInt(this.state.score.replace(/-/g, '')) *
                    (this.state.type === 'a' ? 1 : -1),
                reason: this.state.reason,
            },
            'penalty'
        )
            .then((res: PenaltyResponse) => {
                if (res.success)
                    this.notify({
                        title: <b>성공!</b>,
                        body: '상벌점 부여에 성공했어요.',
                        icon: 'check',
                        dismissIcon: true,
                    })
                else
                    this.notify({
                        title: <b>오류</b>,
                        body: res.message,
                        icon: 'error_outline',
                        dismissIcon: true,
                    })
                this.setState({ score: '', reason: '' })
                setTimeout(() => {
                    this.refresh()
                    this.refreshList()
                }, 0)
            })
            .catch(() => {
                this.notify({
                    title: <b>오류</b>,
                    body: '서버와 연결할 수 없어요.',
                    icon: 'error_outline',
                    dismissIcon: true,
                })
            })
    }

    public remove(pid: PID) {
        fetchAPI('DELETE', {}, 'penalty', pid)
            .then((res: PenaltyResponse) => {
                if (res.success)
                    this.notify({
                        title: <b>성공!</b>,
                        body: '상벌점 삭제에 성공했어요.',
                        icon: 'check',
                        dismissIcon: true,
                    })
                else
                    this.notify({
                        title: <b>오류</b>,
                        body: res.message,
                        icon: 'error_outline',
                        dismissIcon: true,
                    })
                this.setState({ score: '', reason: '' })
                setTimeout(() => {
                    this.refresh()
                    this.refreshList()
                }, 0)
            })
            .catch(() => {
                this.notify({
                    title: <b>오류</b>,
                    body: '서버와 연결할 수 없어요.',
                    icon: 'error_outline',
                    dismissIcon: true,
                })
            })
    }

    public render() {
        let tableBody, listTableBody
        if (this.state?.loaded) {
            try {
                tableBody = this.state.data.data.history
                    .map((el: PenaltyResponseOne) => {
                        try {
                            let time = new Date(el.time)
                            return (
                                <DataTableRow>
                                    <DataTableCell alignEnd>
                                        {(el.score > 0 ? '상점 ' : '벌점 ') +
                                            Math.abs(el.score) +
                                            '점'}
                                    </DataTableCell>
                                    <DataTableCell>{`${time.getFullYear()}/${
                                        time.getMonth() + 1
                                    }/${time.getDate()} ${formatTimeD(
                                        time
                                    )}`}</DataTableCell>
                                    <DataTableCell alignEnd>
                                        {el.teacher.name}
                                    </DataTableCell>
                                    <DataTableCell alignEnd>
                                        {el.info}
                                    </DataTableCell>
                                    <DataTableCell alignEnd>
                                        <IconButton
                                            icon='delete'
                                            onClick={() => {
                                                this.remove(el.pid)
                                            }}
                                        />
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        } catch (e) {
                            return null
                        }
                    })
                    .filter((x: any) => x)
            } catch (e) {}
            if (!tableBody || tableBody.length === 0) {
                let message
                try {
                    message = this.state.data.message
                } catch (e) {}
                if (!message) message = '상벌점 내역이 없어요!'
                tableBody = (
                    <DataTableRow>
                        <DataTableCell>
                            <div>{message}</div>
                        </DataTableCell>
                        <DataTableCell />
                        <DataTableCell />
                        <DataTableCell />
                        <DataTableCell />
                    </DataTableRow>
                )
            }
        } else
            tableBody = (
                <DataTableRow>
                    <DataTableCell>
                        <div>로딩 중...</div>
                    </DataTableCell>
                    <DataTableCell />
                    <DataTableCell />
                    <DataTableCell />
                    <DataTableCell />
                </DataTableRow>
            )
        if (this.state?.loadedList) {
            try {
                listTableBody = this.state.listData.data
                    .map((el: PenaltyResponseOne) => {
                        try {
                            let time = new Date(el.time)
                            return (
                                <DataTableRow>
                                    <DataTableCell alignEnd>
                                        {(el.score > 0 ? '상점 ' : '벌점 ') +
                                            Math.abs(el.score) +
                                            '점'}
                                    </DataTableCell>
                                    <DataTableCell>{`${time.getFullYear()}/${
                                        time.getMonth() + 1
                                    }/${time.getDate()} ${formatTimeD(
                                        time
                                    )}`}</DataTableCell>
                                    <DataTableCell alignEnd>
                                        {el.target.name}
                                    </DataTableCell>
                                    <DataTableCell alignEnd>
                                        {el.teacher.name}
                                    </DataTableCell>
                                    <DataTableCell alignEnd>
                                        {el.info}
                                    </DataTableCell>
                                    <DataTableCell alignEnd>
                                        <IconButton
                                            icon='delete'
                                            onClick={() => {
                                                this.remove(el.pid)
                                            }}
                                        />
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        } catch (e) {
                            return null
                        }
                    })
                    .filter((x: any) => x)
            } catch (e) {}
            if (!listTableBody || listTableBody.length === 0) {
                let message
                try {
                    message = this.state.listData.message
                } catch (e) {}
                if (!message) message = '상벌점 내역이 없어요!'
                listTableBody = (
                    <DataTableRow>
                        <DataTableCell>
                            <div>{message}</div>
                        </DataTableCell>
                        <DataTableCell />
                        <DataTableCell />
                        <DataTableCell />
                        <DataTableCell />
                        <DataTableCell />
                    </DataTableRow>
                )
            }
        } else
            listTableBody = (
                <DataTableRow>
                    <DataTableCell>
                        <div>로딩 중...</div>
                    </DataTableCell>
                    <DataTableCell />
                    <DataTableCell />
                    <DataTableCell />
                    <DataTableCell />
                    <DataTableCell />
                </DataTableRow>
            )
        return (
            <div>
                <Typography use='headline3'>상벌점</Typography>
                <BrIfMobile />
                <Typography use='subtitle1' style={{ marginLeft: '10px' }}>
                    학생들에게 상점/벌점을 부여할 수 있어요.
                </Typography>
                <br />
                <br />
                <Typography use='headline5'>
                    특정 학생 상벌점 조회/부여
                </Typography>
                <br />
                <Grid>
                    <GridRow>
                        <GridCell desktop={8} tablet={8} phone={4}>
                            <SearchUser
                                onKeyDown={(e: any) => {
                                    if (e.key === 'Enter') focusNextInput()
                                }}
                                label='학생 정보'
                                type={[Permission.student]}
                                onSelect={(user: UserInfo) => {
                                    this.setState({ uid: user.uid })
                                }}
                            />
                        </GridCell>
                        <GridCell desktop={4} tablet={8} phone={4}>
                            <Button
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: '45.2px',
                                }}
                                outlined
                                label='조회'
                                trailingIcon='send'
                                onClick={() => {
                                    setTimeout(() => {
                                        this.refresh()
                                    }, 0)
                                }}
                            />
                        </GridCell>
                    </GridRow>
                </Grid>
                {this.state?.data ? (
                    <>
                        <Grid style={{ marginTop: '-30px' }}>
                            <GridRow>
                                <GridCell desktop={2} tablet={4} phone={4}>
                                    <Select
                                        label='상/벌점'
                                        enhanced
                                        outlined
                                        options={[
                                            {
                                                label: '상점',
                                                value: 'a',
                                            },
                                            {
                                                label: '벌점',
                                                value: 'm',
                                            },
                                        ]}
                                        value={this.state.type}
                                        onChange={(e) =>
                                            this.setState({
                                                type: e.currentTarget.value,
                                            })
                                        }
                                    />
                                </GridCell>
                                <GridCell desktop={2} tablet={4} phone={4}>
                                    <TextField
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        outlined
                                        label='점수'
                                        value={this.state?.score}
                                        onChange={(e) =>
                                            this.handleChange(e, 'score')
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter')
                                                focusNextInput()
                                        }}
                                    />
                                </GridCell>
                                <GridCell desktop={6} tablet={5} phone={4}>
                                    <TextField
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        outlined
                                        label='사유'
                                        value={this.state?.reason}
                                        onChange={(e) =>
                                            this.handleChange(e, 'reason')
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter')
                                                focusNextInput()
                                        }}
                                    />
                                </GridCell>
                                <GridCell desktop={2} tablet={3} phone={4}>
                                    <Button
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '45.2px',
                                        }}
                                        outlined
                                        label='부여'
                                        trailingIcon='send'
                                        onClick={() => {
                                            setTimeout(() => {
                                                this.give()
                                            }, 0)
                                        }}
                                    />
                                </GridCell>
                            </GridRow>
                        </Grid>
                        <LinearProgress
                            progress={-this.state?.data?.data?.score / 21.0}
                            buffer={1}
                        />
                        <br />
                        <Typography use='headline4'>
                            현재{' '}
                            {this.state?.data?.data?.score > 0
                                ? '상점'
                                : '벌점'}{' '}
                            {Math.abs(this.state?.data?.data?.score)}점이에요.
                        </Typography>
                        <br />
                        <br />
                        <Typography use='headline5'>상벌점 내역</Typography>
                        <br />
                        <DataTable
                            stickyRows={1}
                            stickyColumns={0}
                            style={{
                                width: 'calc(100% - 40px)',
                                margin: '20px',
                                maxHeight: 'calc(100vh - 300px)',
                            }}>
                            <DataTableContent>
                                <DataTableHead>
                                    <DataTableRow>
                                        <DataTableHeadCell>
                                            받은 점수
                                        </DataTableHeadCell>
                                        <DataTableHeadCell>
                                            받은 시간
                                        </DataTableHeadCell>
                                        <DataTableHeadCell>
                                            부여한 선생님
                                        </DataTableHeadCell>
                                        <DataTableHeadCell alignEnd>
                                            사유
                                        </DataTableHeadCell>
                                        <DataTableHeadCell alignEnd>
                                            작업
                                        </DataTableHeadCell>
                                    </DataTableRow>
                                </DataTableHead>
                                <DataTableBody>{tableBody}</DataTableBody>
                            </DataTableContent>
                        </DataTable>
                        <br />
                        <br />
                        <Button
                            outlined
                            onClick={this.refresh.bind(this)}
                            style={{ marginLeft: '20px' }}>
                            새로고침
                        </Button>
                        <br />
                        <br />
                    </>
                ) : (
                    <></>
                )}
                <br />
                <Typography use='headline5'>
                    최근 부여 상벌점(전체 학생)
                </Typography>
                <br />
                <DataTable
                    stickyRows={1}
                    stickyColumns={0}
                    style={{
                        width: 'calc(100% - 40px)',
                        margin: '20px',
                        maxHeight: 'calc(100vh - 300px)',
                    }}>
                    <DataTableContent>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableHeadCell>받은 점수</DataTableHeadCell>
                                <DataTableHeadCell>받은 시간</DataTableHeadCell>
                                <DataTableHeadCell>받은 학생</DataTableHeadCell>
                                <DataTableHeadCell>
                                    부여한 선생님
                                </DataTableHeadCell>
                                <DataTableHeadCell alignEnd>
                                    사유
                                </DataTableHeadCell>
                                <DataTableHeadCell alignEnd>
                                    작업
                                </DataTableHeadCell>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>{listTableBody}</DataTableBody>
                    </DataTableContent>
                </DataTable>
                <br />
                <br />
                <Button
                    outlined
                    onClick={this.refreshList.bind(this)}
                    style={{ marginLeft: '20px' }}>
                    새로고침
                </Button>
                <SnackbarQueue messages={this.messages} />
            </div>
        )
    }
}

export default Penalty
