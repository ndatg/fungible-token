const { Contract } = require('tonweb');
const { Address, bytesToHex, bytesToBase64, BN } = require("tonweb").utils;
const { Cell } = require('tonweb').boc;

const HEX = 'B5EE9C7241023301000444000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CB1213020120060702012008090201201011011BB93EFDB3C02FA443101FA4431588280201200A0B0201620C0D0109B4D67B67900F0008AB475B700108A91DDB3C0E000EED44F005145F04001CED44F0056C41D0D4D4D307D4D4300109BB946DB3C82E0109BBF12DB3C83002014814150201481D1E03EDD1968698180B8D84BADC108555555557010E3804BADC10855555555707D201800E98FE99FC1081000000029185D474AB610FD2069FF98112CF809B82A0900291840206D9E7041081800000029185D4752B610FD2069FFEA1811AA90780A41081800000029085EC745382A0900291840206D9E4898F17041A1A160201481B1C04828210100000005230BA8F276C12D3FF3021DB3C5B544330F0158210100000005210BA926C129131E27054120052308040DB3CE03182104000000023DB3CB05220BA281A181704808E9231FA40D3FF30F0167054120052308040DB3CE082105000000023DB3CB012BA8E91FA40D3FF30F0177054120052308040DB3CE030708210FFFFFFFF2180401A181A190022ED44F005145F0401FA443101BA917FE0700110DB3C8210FFFFFFFF1A0034708018C8CB055006CF165004FA0214CB6ACB1F12CB3FC901FB00001F01323D0004FD0032FFF2FFF3327B55200017343D013D0134FFF4FFF50C200377F117D2218E0004C2F81C10810000000F010FD2218E0004C2F81C1081000000170116D9E116D9E29895CCC2F82C10810000001F0288950815010E00042E2E1F020120222303208E843102DB3C8E845033DB3CE221C000212F2002228E8331DB3C8E8301DB3CE2821020000000212F0026ED44F00505FA443150048307F45B304134F00402012024250201202B2C0253151CC87C04E0840800000014842EA3C54C150CC876CF1C1C100101601036CF20840C000000249B1078A0262703750876CF0C013E910C493E910C6F6617C12084040000007808708023A408F6CF14C82F244CA44C3890C03C04CC250408D7C0F8B6CF20840400000020282E290058ED44F00570248040F48E6FA56C129231A49130E2C85009CF165007CF1615CBFF5420638040F443443302F004003C708018C8CB055008CF165006FA0216CB6A12CB1FCB3FCBFF12CCC901FB000250ED44F00510345F047020DB3C7020DB3C7050438040F40E6FA19A6C31FA40FA40D3FF30589130E2592A2A0020ED44F00550538040F45B30034144F004001C7072C8CB01CB0012CA07CBFFC9D00435087E910C700025D6E084100000007836CF086836CF0876CF00682030322E2D0451087E910C700025D6E08414000000780876CF14C06E6617C0E08414000000B8086844B6CF36CF0068602E2F30310110DB3C8210400000002F0034ED44F0055F047002FA4431018307F40E6FA19431D3FF309130E2002CED44F00506FA443105C8CBFF40548307F4435034F0040010ED44F00510245F040110DB3C821050000000320016ED44F0053210344300F004D73E80BF';

class FTContract extends Contract {
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(HEX);
        super(provider, options);
    }

    createCodeCell() {
        if (!this.options.code) throw new Error('Contract: options.code is not defined')
        return this.options.code;
    }

    createDataCell() {
        const cell = new Cell();
        const metadata = new Cell();

        const name = new Cell();
        name.bits.writeString(this.options.name);
        const symbol = new Cell();
        symbol.bits.writeString(this.options.symbol);
        const icon = new Cell();
        icon.bits.writeString(this.options.icon);
        const spec = new Cell();
        spec.bits.writeString(this.options.spec);

        metadata.refs[0] = name;
        metadata.refs[1] = symbol;
        metadata.bits.writeUint(this.options.decimals, 8);
        metadata.refs[2] = icon;
        metadata.refs[3] = spec;

        cell.bits.writeUint(0, 1); // balances
        cell.bits.writeUint(0, 1); // callbacks
        cell.bits.writeUint(this.options.totalSupply, 256);
        cell.bits.writeUint(this.options.ownerAddr, 256);
        cell.refs[0] = metadata;

        if (this.options.salt) {
            cell.bits.writeUint(this.options.salt, 64); // salt
        }

        return cell;
    }

    async createStateInit() {
        const codeCell = this.createCodeCell();
        const dataCell = this.createDataCell();
        const stateInit = Contract.createStateInit(codeCell, dataCell);
        const stateInitHash = await stateInit.hash();
        const address = new Address(this.options.wc + ":" + bytesToHex(stateInitHash));
        return {
            stateInit: stateInit,
            address: address,
            code: codeCell,
            data: dataCell,
        }
    }

    createTransferBody(params) {
        const cell = new Cell();

        cell.bits.writeUint(0x20000000, 32);
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(params.receiver);
        cell.bits.writeUint(params.amount, 256);

        return cell;
    }

    createTransferCallBody(params) {
        const cell = new Cell();

        cell.bits.writeUint(0x30000000, 32);
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(params.receiver);
        cell.bits.writeUint(params.amount, 256);
        cell.refs[0] = params.payload;

        return cell;
    }

    createMintBody(params) {
        const cell = new Cell();

        cell.bits.writeUint(0x40000000, 32);
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(params.account);
        cell.bits.writeUint(params.amount, 256);

        return cell;
    }

    createBurnBody(params) {
        const cell = new Cell();

        cell.bits.writeUint(0x50000000, 32);
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(params.account);
        cell.bits.writeUint(params.amount, 256);

        return cell;
    }

    async getMetadata() {
        const address = (await this.getAddress()).toString();
        const result = await this.provider.call2(address, 'metadata');
        return {
            name: Buffer.from(result[0].bits.toString(), 'hex').toString('utf8'),
            symbol: Buffer.from(result[1].bits.toString(), 'hex').toString('utf8'),
            decimals: result[2].toNumber(),
            icon: Buffer.from(result[3].bits.toString(), 'hex').toString('utf8'),
            spec: Buffer.from(result[4].bits.toString(), 'hex').toString('utf8')
        };
    }

    async getTotalSupply() {
        const address = (await this.getAddress()).toString();
        const result = await this.provider.call2(address, 'total_supply');
        return result.toNumber();
    }

    async getBalanceOf(account) {
        const address = (await this.getAddress()).toString();

        const accountCell = new Cell();
        accountCell.bits.writeAddress(account);

        const result = await this.provider.call2(address, 'balance_of', [
            ['tvm.Slice', bytesToBase64(await accountCell.toBoc(false))]
        ]);
        return result.toNumber();
    }

    async getAllowance(owner, spender) {
        const address = (await this.getAddress()).toString();

        const ownerCell = new Cell();
        ownerCell.bits.writeAddress(owner);

        const spenderCell = new Cell();
        spenderCell.bits.writeAddress(spender);

        const result = await this.provider.call2(address, 'allowance', [
            ['tvm.Slice', bytesToBase64(await ownerCell.toBoc(false))],
            ['tvm.Slice', bytesToBase64(await spenderCell.toBoc(false))]
        ]);
        return result.toNumber();
    }

    async getCallback(id) {
        const address = (await this.getAddress()).toString();

        const idCell = new Cell();
        idCell.bits.writeUint(id, 64);

        const result = await this.provider.call2(address, 'callback', [
            ['num', id]
        ]);

        return {
            sender: result[0].toString(16),
            receiver: result[1].toString(16)
        };
    }
}

module.exports = FTContract;
