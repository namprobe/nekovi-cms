// src/entities/shipping/types/ghn-callback.ts

export interface GHNCallbackFee {
    CODFailedFee?: number | null
    CODFee?: number | null
    Coupon?: number | null
    DeliverRemoteAreasFee?: number | null
    DocumentReturn?: number | null
    DoubleCheck?: number | null
    Insurance?: number | null
    MainService?: number | null
    PickRemoteAreasFee?: number | null
    R2S?: number | null
    Return?: number | null
    StationDO?: number | null
    StationPU?: number | null
    Total?: number | null
}

export interface GHNCallbackPayload {
    CODAmount?: number | null
    CODTransferDate?: string | null
    ClientOrderCode?: string | null
    ConvertedWeight?: number | null
    Description?: string | null
    Fee?: GHNCallbackFee | null
    Height?: number | null
    IsPartialReturn?: boolean | null
    Length?: number | null
    OrderCode: string
    PartialReturnCode?: string | null
    PaymentType?: number | null
    Reason?: string | null
    ReasonCode?: string | null
    ShopID?: number | null
    Status: string
    Time?: string | null
    TotalFee?: number | null
    Type?: string | null
    Warehouse?: string | null
    Weight?: number | null
    Width?: number | null
}

