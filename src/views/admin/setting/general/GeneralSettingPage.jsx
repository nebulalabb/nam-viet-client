import { Button } from '@/components/custom/Button'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowLeft,
  IconClock,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateGeneralSettingSchema } from '../schema'
import { getSetting, updateGeneralSetting } from '@/stores/SettingSlice'
import { dateFormat } from '@/utils/date-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { useFieldArray } from 'react-hook-form'
import { IconTrash } from '@tabler/icons-react'

const BANK_MAPPING = {
  // Big 4
  vietinbank: 'ICB',
  vietcombank: 'VCB',
  bidv: 'BIDV',
  agribank: 'VBA',

  // Popular banks
  techcombank: 'TCB',
  mbbank: 'MB',
  mb: 'MB',
  acb: 'ACB',
  tpbank: 'TPB',
  vpbank: 'VPB',
  sacombank: 'STB',
  hdbank: 'HDB',
  ocb: 'OCB',
  shb: 'SHB',
  eximbank: 'EIB',
  msb: 'MSB',
  seabank: 'SSB',
  lienvietpostbank: 'LPB',
  pvcombank: 'PVCB',
  vib: 'VIB',
  baoviet: 'BVBANK',
  ncb: 'NCB',
  abbank: 'ABB',
  bacabank: 'BAB',
  kienlongbank: 'KLB',
  namabank: 'NAB',
  pgbank: 'PGB',
  saigonbank: 'SGB',
  vietabank: 'VAB',
  vieta: 'VAB',
  vietbank: 'VBB',
  vietcapital: 'BVB',

  // Foreign banks
  woori: 'WVN',
  shinhan: 'SHBVN',
  uob: 'UOB',
  hsbc: 'HSBC',
  scb: 'SCVN',
  cimb: 'CIMB',
  public: 'PBVN',

  // E-wallets
  momo: 'MOMO',
  vnpay: 'VNPAY',
  zalopay: 'ZALO',
}

const GeneralSettingPage = () => {
  const loading = useSelector((state) => state.setting.loading)
  const setting = useSelector((state) => state.setting.setting)
  const dispatch = useDispatch()

  useEffect(() => {
    document.title = 'Cài đặt chung'
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(updateGeneralSettingSchema),
    defaultValues: {
      generalSetting: {
        brandName: '',
        logo: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        taxCode: '',
        website: '',
        banks: [
          {
            accountNumber: '',
            accountName: '',
            bankName: '',
            bankBranch: '',
          },
        ],
      },
    },
  })

  useEffect(() => {
    if (setting) {
      form.reset({
        generalSetting: {
          brandName: setting.brandName || '',
          logo: setting.logo || '',
          name: setting.name || '',
          email: setting.email || '',
          phone: setting.phone || '',
          address: setting.address || '',
          taxCode: setting.taxCode || '',
          website: setting.website || '',
          banks:
            setting.banks?.length > 0
              ? setting.banks
              : [
                {
                  accountNumber: '',
                  accountName: '',
                  bankName: '',
                  bankBranch: '',
                },
              ],
        },
      })
    }
  }, [setting, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'generalSetting.banks',
  })

  const onSubmit = async (data) => {
    try {
      await dispatch(updateGeneralSetting(data)).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const navigate = useNavigate()

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Cài đặt chung</h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Form {...form}>
            <form
              id="update-general-setting"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="my-3 grid gap-4 rounded-lg border p-4 md:grid-cols-3">
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-[20px] w-full rounded-md" />
                    </div>
                  ))
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="generalSetting.brandName"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Tên công ty</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Vui lòng thêm tên công ty"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.logo"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel>Logo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Vui lòng thêm logo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.name"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Tên website</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên website" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.email"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Nhập địa chỉ email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.phone"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập số điện thoại"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.address"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Địa chỉ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập địa chỉ công ty"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.taxCode"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Mã số thuế</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã số thuế" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.website"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Địa chỉ website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập địa chỉ website"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-full space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base font-semibold">
                          Tài khoản ngân hàng
                        </FormLabel>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            append({
                              accountNumber: '',
                              accountName: '',
                              bankName: '',
                              bankBranch: '',
                            })
                          }
                        >
                          + Thêm tài khoản
                        </Button>
                      </div>

                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid gap-4 rounded-md border p-4
               md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                        >
                          <FormField
                            control={form.control}
                            name={`generalSetting.banks.${index}.accountNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số tài khoản</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập số tài khoản"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`generalSetting.banks.${index}.accountName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên tài khoản</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập tên tài khoản"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`generalSetting.banks.${index}.bankName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ngân hàng</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn ngân hàng" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="h-96">
                                    {Object.keys(BANK_MAPPING).map((bankKey) => (
                                      <SelectItem key={bankKey} value={bankKey}>
                                        <span className="capitalize">
                                          {bankKey} ({BANK_MAPPING[bankKey]})
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`generalSetting.banks.${index}.bankBranch`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chi nhánh</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="VD: CN Cần Thơ"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* ACTION - AUTO WIDTH */}
                          <div className="flex items-end justify-center pb-1">
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:text-red-700"
                                onClick={() => remove(index)}
                                title="Xóa tài khoản"
                              >
                                <IconTrash size={18} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="col-span-full">
                  <Alert className="border-blue-500 text-primary">
                    <AlertTitle className="text-md font-bold">
                      Thông tin về cài đặt
                    </AlertTitle>
                    <AlertDescription>
                      <ul className="list-inside list-disc">
                        <li className="flex items-center space-x-2">
                          <IconUser className="h-4 w-4" />
                          <span>
                            Người cập nhật sau cùng:{' '}
                            <strong>{setting?.user?.fullName || 'N/A'}</strong>
                          </span>
                        </li>

                        <li className="flex items-center space-x-2">
                          <IconClock className="h-4 w-4" />
                          <span>
                            Lần cập nhật mới nhất:{' '}
                            <strong>
                              {setting?.updatedAt ? dateFormat(setting.updatedAt, true) : 'N/A'}
                            </strong>
                          </span>
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex justify-end md:col-span-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2 w-32"
                    onClick={() => navigate(-1)}
                  >
                    <IconArrowLeft className="h-4 w-4" /> Quay lại
                  </Button>

                  <Button
                    type="submit"
                    className="w-32"
                    form="update-general-setting"
                    loading={loading}
                  >
                    {!loading && <IconRefresh className="mr-2 h-4 w-4" />} Cập
                    nhật
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default GeneralSettingPage
