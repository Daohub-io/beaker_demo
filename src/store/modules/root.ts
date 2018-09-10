import {Project} from '@/store/modules/project'
import {Account} from '@/store/modules/account'
import {Network} from '@/store/modules/network'

export default interface Root {
    project: Project;
    network: Network;
    account: Account;
}